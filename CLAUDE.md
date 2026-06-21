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
`lib/db.js` exports a singleton `better-sqlite3` instance (ES module `import/export`), read from `process.env.DATABASE_PATH`. Route Handlers and Server Actions import directly from there — no ORM, no connection pool.

`db/init.js` and `db/seed.js` are standalone scripts that run with plain Node — they use CommonJS (`require`). Do not mix this up: app code uses ESM, scripts use CJS.

### Cart state
Client-side only: React Context + `localStorage`. No server-side cart, no session. Cart is serialized to `localStorage` on every change and rehydrated on mount.

### Admin auth
Password stored in `ADMIN_PASSWORD` env var. Admin routes (`/admin/*`) are not locale-prefixed and check a cookie set at `/admin/login`. No user accounts, no JWT — just a simple cookie comparison.

### Age verification
NOT YET IMPLEMENTED — placeholder pages only. When built: must run before any `/[locale]/shop*` route (layout check or proxy interceptor), set a cookie on confirmation, clear on session end.

## Hard Rules
- NEVER integrate Stripe, PayPal, or any online payment processor. Checkout is cash-on-delivery (Наложен платеж) only, fulfilled via Ekont or Speedy courier.
- NEVER remove or bypass the age-verification gate on the storefront (this is an alcohol product).
- Orders are NOT auto-confirmed. They're created with status `pending` and only move to `confirmed` via a manual action in the admin panel.
- The wholesale/B2B page is a plain inquiry form — no login, no account system, no tiered pricing logic in code.
- NEVER generate, source, or insert placeholder/stock images into the `img` folders. Create the folder structure only (with `.gitkeep` files so git tracks the empty dirs) — real product photos are added manually later.

## Local Development
- DB path comes from `DATABASE_PATH` env var (set in `.env.local`, gitignored) — never hardcode `/data/shop.db` in code.
- Railway deployment will be done manually later — don't generate Railway-specific config (`railway.json`, etc.) unless asked.
- Locale routing lives in `proxy.js` (Next.js 16 renamed `middleware.js` → `proxy.js`). Do not create a `middleware.js`.
- The root `img/` folder contains real product photos already tracked in git. It is distinct from `public/img/` (which has only `.gitkeep` placeholders for web-served images).

## Deployment (Railway) — for later
- One Next.js service with a Railway Volume mounted at `/data`; set `DATABASE_PATH=/data/shop.db` in the Railway service's variables.
- Set `RAILWAY_RUN_UID=0` (volumes mount as root; Node's non-root user can't write otherwise).
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
- Form validation happens inside the Server Action (server-side); client-side validation is optional UX only.
- Every user-facing string goes through `next-intl` — never hardcoded in one language.
- Images: `.webp` format, referenced via Next.js `<Image>`. Empty placeholder dirs: `public/img/products/`, `public/img/hero/`, `public/img/brand/` (tracked with `.gitkeep`).

## Subagents (VoltAgent core-development pack)
- `fullstack-developer` — primary agent now that frontend + backend live in one Next.js app
- `frontend-developer` — page/component-level UI work
- `api-designer` — use when shaping new route handlers

## Workflow
For any multi-step task, maintain a visible todo list and update it as you go.
