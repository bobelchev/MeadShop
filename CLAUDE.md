# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
B2C e-commerce site selling honey and mead (fermented honey alcohol), Bulgarian market, plus a simple B2B wholesale inquiry page. Bilingual: Bulgarian (default) and English, with a toggle. Checkout is cash-on-delivery only — there is no payment gateway in this project.

## Stack
- Runtime: Node 22
- Framework: Next.js 16 (App Router) + React 19 — handles both frontend and backend in one app
- Styling: Tailwind CSS
- i18n: `next-intl` v4, locale-prefixed routes (`/bg/...` default, `/en/...`)
- DB: SQLite via `better-sqlite3`, accessed directly from Route Handlers / Server Actions
- Deployment: Railway, single service

Config is `next.config.mjs` (ESM). It must keep `serverExternalPackages: ['better-sqlite3']` — removing this breaks the native module in the Next.js build.

## Commands
```bash
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

No test runner is configured. Verify features by running the dev server.

Requires `.env.local` with `DATABASE_PATH=./data/shop.db` before first run:
```bash
npm run db:init   # creates tables in ./data/shop.db; run once
npm run db:seed   # inserts 3 sample products; optional
```

## Architecture

### Why one Next.js app instead of a separate Express backend
`better-sqlite3` is synchronous and works best with a single process owning the DB file. One Railway service, one deploy, one Volume, no CORS setup. Server Actions handle form submissions with far less boilerplate than separate REST endpoints.

### DB access pattern
`lib/db.js` exports a **lazy** singleton via a `Proxy`. The DB connection is created on first property access, not at module import. This lets `next build` succeed even when `DATABASE_PATH` isn't set in the build environment. Callers use the export identically to a real `Database` instance — the Proxy is transparent.

On first open, `lib/db.js` imports `db/schema.js` via `createRequire` and calls `db.exec(schema)`. This runs `CREATE TABLE IF NOT EXISTS` for every table, so all tables are guaranteed to exist at runtime regardless of whether `npm run db:init` was executed beforehand. Do not add schema setup elsewhere.

`db/init.js` and `db/seed.js` are standalone scripts that run with plain Node — they use CommonJS (`require`). Do not mix this up: app code uses ESM, scripts use CJS. `db/schema.js` is a CJS module that exports the raw SQL string as `module.exports.schema`.

### Cart state
Client-side only: React Context + `localStorage`. Implemented in `context/CartContext.js`. Cart is serialized to `localStorage` on every change and rehydrated on mount. `CartProvider` wraps the locale layout in `app/[locale]/layout.js`. `useCart()` hook provides `addItem`, `removeItem`, `updateQty`, `clearCart`, `totalItems`, `totalPrice`.

### Admin auth
Password stored in `ADMIN_PASSWORD` env var. Admin routes use a `(protected)` route group (`app/admin/(protected)/`) whose `layout.js` reads the `admin_session` cookie (sha256 of `ADMIN_PASSWORD`) and redirects to `/admin/login` if absent or wrong. Cookie is set httpOnly, sameSite strict, secure in production, path `/admin`.

`app/admin/layout.js` is a **parallel root layout** — it renders its own `<html>` and `<body>` tags. Don't wrap it in a nested layout or add another `<html>/<body>` inside it.

`AdminNav` is a Client Component at `app/admin/(protected)/AdminNav.js`. It uses `usePathname()` for active-link highlighting and is rendered by the `(protected)` layout — do not add nav markup to individual admin pages.

`/admin/logout` is a GET route handler that clears the cookie and redirects to `/admin/login`.

### Age verification
Implemented. `proxy.js` (middleware) matches `/[locale]/shop*` routes, checks the `age_verified` cookie, and redirects to `/[locale]/age-gate?returnTo=...` if missing. The age gate page sets the cookie via a Server Action on confirmation.

### SEO
All locale pages export `generateMetadata` using `getTranslations({ locale, namespace })` with locale from `await params`. Product detail uses a DB query for name/description. `app/sitemap.js` lists all static routes + active products for both locales — it has `export const dynamic = 'force-dynamic'` to prevent build-time DB access. `app/robots.js` disallows `/admin/`.

### Cookie banner
`components/CookieBanner.js` is a Client Component. The locale layout reads the `cookie_consent` cookie server-side and passes it as `initialConsent` prop to avoid flash on return visits. Accepting sets the cookie client-side for one year.

### Email notifications
`lib/email.js` sends a plain-text order notification via nodemailer when an order is placed. Reads `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL` from env. Returns early if `SMTP_HOST` or `NOTIFY_EMAIL` are absent. Errors are caught and logged — never crash the checkout.

## Implementation Status
All customer-facing pages are fully built:
- Home, shop listing, product detail (with image slideshow), cart, checkout (COD), order confirmation, wholesale inquiry, about, contact, age gate

Admin panel is fully built:
- Login, logout, orders (list + status update), wholesale inquiries (list + status update), products (list, create, edit, delete with image upload/remove)

**API route handlers are stubs** — all return hardcoded empty responses and are not used by the frontend (which queries the DB directly in Server Components).

## Hard Rules
- NEVER integrate Stripe, PayPal, or any online payment processor. Checkout is cash-on-delivery (Наложен платеж) only, fulfilled via Ekont or Speedy courier.
- NEVER remove or bypass the age-verification gate on the storefront (this is an alcohol product).
- Orders are NOT auto-confirmed. They're created with status `pending` and only move to `confirmed` via a manual action in the admin panel.
- The wholesale/B2B page is a plain inquiry form — no login, no account system, no tiered pricing logic in code.
- NEVER generate, source, or insert placeholder/stock images into the `img` folders. Create the folder structure only (with `.gitkeep` files so git tracks the empty dirs) — real product photos are added manually later.

## Local Development
- `.env` is committed with Railway production defaults (`DATABASE_PATH=/data/shop.db`, `RAILWAY_RUN_UID=0`). For local dev, create `.env.local` with `DATABASE_PATH=./data/shop.db` — Next.js loads `.env.local` last so it takes precedence.
- If `better-sqlite3` throws an ABI version mismatch after a Node upgrade, run `npm rebuild better-sqlite3`.
- Locale routing lives in `proxy.js` (Next.js 16 renamed `middleware.js` → `proxy.js`). Do not create a `middleware.js`.
- The root `img/` folder contains real product photos already tracked in git. It is distinct from `public/img/` (which has only `.gitkeep` placeholders for web-served images).

## Deployment (Railway)
- `railway.toml` exists: `preDeployCommand = "npm run db:init"` runs DB initialisation before each deploy (safe to run repeatedly).
- `DATABASE_PATH=/data/shop.db` and `RAILWAY_RUN_UID=0` are in the committed `.env` as Railway defaults; the Railway Volume must be mounted at `/data`.
- Never write the DB file during the build step — only at runtime, or data won't land on the volume.
- Any `app/` file that queries the DB must have `export const dynamic = 'force-dynamic'` if Next.js would otherwise try to prerender it (e.g. `app/sitemap.js`). Route handlers and Server Components under dynamic `[param]` segments are already dynamic.
- Single instance only (volume doesn't support horizontal scaling).

## Internationalization
- Default locale: `bg`. Secondary: `en`.
- Translation strings in `/messages/bg.json` and `/messages/en.json` — 12 namespaces: `nav`, `home`, `shop`, `age_gate`, `product`, `cart`, `checkout`, `order_confirmation`, `wholesale`, `about`, `contact`, `cookie_banner`. Each page namespace also has `meta_title` and `meta_description` keys for SEO.
- The locale toggle in the header switches routes (`/bg/...` ↔ `/en/...`) — not a client-side text swap.
- Product content (`name_bg`/`name_en`, `description_bg`/`description_en`) is bilingual DB data, not UI strings.

next-intl v4 patterns in use:
- `i18n/request.js`: `getRequestConfig(async ({ requestLocale }) => { const locale = (await requestLocale) ?? 'bg'; ... })`
- Server Components: `getTranslations('ns')` or `getTranslations({ locale, namespace: 'ns' })` (use the second form in `generateMetadata` where locale comes from `await params`), and `getLocale()` from `next-intl/server`
- Client Components: `useTranslations`, `useLocale` from `next-intl` (require `NextIntlClientProvider` ancestor)
- `NextIntlClientProvider` is in `app/[locale]/layout.js` — it receives `messages` from `getMessages()` server-side

## Data Model
```
products(id, name_bg, name_en, category[honey|mead], variant, price_bgn, stock_qty,
         description_bg, description_en, image_path, active)
product_images(id, product_id → products.id ON DELETE CASCADE, image_path, sort_order)
orders(id, customer_name, phone, email, delivery_method[ekont_office|ekont_door|speedy_office|speedy_door],
       address_or_office, city, notes, status[pending|confirmed|shipped|delivered|cancelled], total_amount, created_at)
order_items(id, order_id → orders.id, product_id → products.id, qty, unit_price)
wholesale_inquiries(id, company_name, contact_name, phone, email, message, estimated_volume, status[new|contacted|closed], created_at)
```

Products cannot be deleted if they appear in `order_items` (FK constraint). Set `active = 0` to hide them from the shop instead.

## API & Server Actions
```
GET   /api/products              -> route handler (stub)
GET   /api/products/[id]         -> route handler (stub)
      createOrder()              -> server action (checkout form)
GET   /api/orders                -> route handler (stub, admin only)
      updateOrderStatus()        -> server action (admin)
      createWholesaleInquiry()   -> server action (wholesale form)
GET   /api/wholesale             -> route handler (stub, admin only)
      createProduct()            -> server action (admin products)
      updateProduct()            -> server action (admin products)
      deleteProduct()            -> server action (admin products)
```

## Pages (App Router, under `/[locale]/`)
- `/` — home / brand story
- `/shop` — product grid, filter by honey / mead
- `/shop/[id]` — product detail with image slideshow
- `/cart` — client-side cart
- `/checkout` — COD form (name, phone, address, courier choice, notes)
- `/order-confirmation` — shows order summary, clears cart
- `/wholesale` — B2B inquiry form
- `/about`, `/contact`
- `/age-gate` — age verification (enforced by proxy.js on all `/[locale]/shop*` routes)

Admin (not locale-prefixed, protected by `(protected)` layout):
- `/admin/login`, `/admin/logout`
- `/admin/orders` — list + status update
- `/admin/wholesale` — list + status update
- `/admin/products` — list with delete; `/admin/products/new`; `/admin/products/[id]`

## Conventions
- Server Actions and Route Handlers live alongside their routes (`actions.js` / `route.js` per `app/` segment).
- DB schema and seed scripts in `/db`.
- Shared UI components in `/components` (`Header.js`, `LanguageToggle.js`, `MobileMenu.js`, `CookieBanner.js`, `CartBadgeLink.js`). `Header` is a Server Component; `MobileMenu` and `CookieBanner` are Client Components.
- `lib/i18n.js` exports `getLocalizedField(product, field, locale)` — use this instead of inline `product[name_${locale}]` lookups.
- `lib/adminActions.js` exports `updateStatus(table, validStatuses, revalidateUrl, rowId, formData)` — shared helper used by orders and wholesale status-update actions. Not a `'use server'` file; import it from within `'use server'` action files.
- Form validation happens inside the Server Action (server-side); client-side validation is optional UX only.
- Every user-facing string goes through `next-intl` — never hardcoded in one language. Admin UI is English-only and does not use `next-intl`.
- Images: `.webp` format, referenced via Next.js `<Image>`. Uploaded product images are stored in `public/img/products/` with a `${Date.now()}-${random}${ext}` filename. `product_images` rows are managed in `saveProductImages()` inside the products `actions.js` using a transaction.
- `lib/db.js` already sets WAL mode, `foreign_keys = ON`, and runs `db.exec(schema)` — do not set these pragmas or run schema elsewhere.

## Design System
`tailwind.config.js` and `app/globals.css` contain a full brand design system — do not rebuild or override it:
- **Color tokens**: `honey-*` (amber/gold), `mead-*` (deep plum), `cream-*` (warm ivory), `bark-*` (dark brown text), `stone-*` (muted grey)
- **Typography**: `font-display` = Playfair Display (headings, serif), `font-body` = Inter (body, sans). Google Fonts loaded in `app/layout.js`.
- **Component classes** (in `globals.css` `@layer components`): `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-ghost-inverted` (for dark backgrounds), `btn-mead`, `card-product`, `card-body`, `card-image-placeholder`, `badge-honey`, `badge-mead`, `section`, `section-narrow`, `ornament-rule`
- **Utility classes** (in `@layer utilities`): `bg-honey-placeholder`, `bg-mead-placeholder` (gradient fills for product image areas), `bg-hero-parchment`, `bg-mead-panel`, `hero-overlay`, `text-shadow-warm`
- Product image areas use `bg-honey-placeholder` or `bg-mead-placeholder` gradient divs until real photos are added — never use `<img>` placeholders or stock images.

## Subagents (VoltAgent core-development pack)
- `fullstack-developer` — primary agent now that frontend + backend live in one Next.js app
- `frontend-developer` — page/component-level UI work
- `api-designer` — use when shaping new route handlers

## Workflow
For any multi-step task, maintain a visible todo list and update it as you go.
