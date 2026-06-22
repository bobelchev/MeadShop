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

`db/init.js` and `db/seed.js` are standalone scripts that run with plain Node — they use CommonJS (`require`). Do not mix this up: app code uses ESM, scripts use CJS. `db/schema.js` is a CJS module that exports the raw SQL string as `module.exports.schema`; `init.js` requires it and executes it.

### Cart state
Client-side only: React Context + `localStorage`. No server-side cart, no session. Cart is serialized to `localStorage` on every change and rehydrated on mount. **Not yet built** — no `context/` directory exists yet.

### Implementation status
**Built:** home page (`/[locale]/page.js`), shop listing page (`/[locale]/shop/page.js` + `ShopGrid.js`).

**Stubs (return placeholder text):** `/shop/[id]`, `/cart`, `/checkout`, `/order-confirmation`, `/wholesale`, `/about`, `/contact`, `/admin/login`, `/admin/orders`, `/admin/wholesale`.

**API route handlers are also stubs** — all currently return hardcoded empty arrays (`{ products: [] }`, `{ orders: [] }`, etc.) rather than querying the DB.

The `ShopGrid.js` pattern: `ShopPage` (Server Component) fetches products from the DB and passes them as a prop to `ShopGrid` (Client Component) which handles category filtering with `useState`. The "Add to Cart" button inside `ShopGrid` is presentational only — it stops the card link navigation but doesn't add anything to a cart yet.

### Admin auth
Password stored in `ADMIN_PASSWORD` env var. Admin routes (`/admin/*`) are not locale-prefixed and check a cookie set at `/admin/login`. No user accounts, no JWT — just a simple cookie comparison.

`app/admin/layout.js` is a **parallel root layout** — it renders its own `<html>` and `<body>` tags. Don't wrap it in a nested layout or add another `<html>/<body>` inside it.

### Age verification
NOT YET IMPLEMENTED — placeholder pages only. When built: must run before any `/[locale]/shop*` route (layout check or proxy interceptor), set a cookie on confirmation, clear on session end.

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
- `railway.toml` exists: `preDeployCommand = "npm run db:init"` runs DB initialisation before each deploy (safe to run repeatedly — uses `CREATE TABLE IF NOT EXISTS`).
- `DATABASE_PATH=/data/shop.db` and `RAILWAY_RUN_UID=0` are in the committed `.env` as Railway defaults; the Railway Volume must be mounted at `/data`.
- Never write the DB file during the build step — only at runtime, or data won't land on the volume.
- Single instance only (volume doesn't support horizontal scaling).

## Internationalization
- Default locale: `bg`. Secondary: `en`.
- Translation strings in `/messages/bg.json` and `/messages/en.json`.
- The locale toggle in the header switches routes (`/bg/...` ↔ `/en/...`) — not a client-side text swap.
- Product content (`name_bg`/`name_en`, `description_bg`/`description_en`) is bilingual DB data, not UI strings.

next-intl v4 patterns in use:
- `i18n/request.js`: `getRequestConfig(async ({ requestLocale }) => { const locale = (await requestLocale) ?? 'bg'; ... })`
- Server Components: `getTranslations('ns')` and `getLocale()` from `next-intl/server`
- Client Components: `useTranslations`, `useLocale` from `next-intl` (require `NextIntlClientProvider` ancestor)
- `NextIntlClientProvider` is in `app/[locale]/layout.js` — it receives `messages` from `getMessages()` server-side

## Data Model
```
products(id, name_bg, name_en, category[honey|mead], variant, price_bgn, stock_qty,
         description_bg, description_en, image_path, active)
orders(id, customer_name, phone, email, delivery_method[ekont_office|ekont_door|speedy_office|speedy_door],
       address_or_office, city, notes, status[pending|confirmed|shipped|delivered|cancelled], total_amount, created_at)
order_items(id, order_id, product_id, qty, unit_price)
wholesale_inquiries(id, company_name, contact_name, phone, email, message, estimated_volume, status[new|contacted|closed], created_at)
```

## API & Server Actions
```
GET   /api/products              -> route handler
GET   /api/products/[id]         -> route handler
      createOrder()              -> server action (checkout form)
GET   /api/orders                -> route handler (admin only)
      updateOrderStatus()        -> server action (admin)
      createWholesaleInquiry()   -> server action (wholesale form)
GET   /api/wholesale             -> route handler (admin only)
```

## Pages (App Router, under `/[locale]/`)
- `/` — home / brand story
- `/shop` — product grid, filter by honey / mead
- `/shop/[id]` — product detail
- `/cart` — client-side cart
- `/checkout` — COD form (name, phone, address, courier choice, notes)
- `/order-confirmation`
- `/wholesale` — B2B inquiry form
- `/about`, `/contact`
- `/admin/login`, `/admin/orders`, `/admin/wholesale` — password-protected, not locale-prefixed

## Conventions
- Server Actions and Route Handlers live alongside their routes (`actions.js` / `route.js` per `app/` segment).
- DB schema and seed scripts in `/db`.
- Shared UI components in `/components` (`Header.js`, `LanguageToggle.js`, `MobileMenu.js`). `Header` is a Server Component; `MobileMenu` is a Client Component that receives nav links as a plain prop and handles the hamburger/drawer toggle.
- Form validation happens inside the Server Action (server-side); client-side validation is optional UX only.
- Every user-facing string goes through `next-intl` — never hardcoded in one language.
- Images: `.webp` format, referenced via Next.js `<Image>`. Empty placeholder dirs: `public/img/products/`, `public/img/hero/`, `public/img/brand/` (tracked with `.gitkeep`).
- `lib/db.js` already sets WAL mode and `foreign_keys = ON` — do not set these pragmas again in other code.

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
