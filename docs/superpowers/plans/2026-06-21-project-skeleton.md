# Project Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the honey & mead shop Next.js skeleton — App Router, Tailwind, next-intl (bg/en), SQLite schema, and all routes scaffolded — ready for feature work, with no implemented UI.

**Architecture:** Single Next.js 15 App Router app. All public pages live under `app/[locale]/` with next-intl middleware handling locale detection and routing. Admin pages live at `app/admin/` with no locale prefix. `better-sqlite3` is accessed via a singleton in `lib/db.js`; standalone CommonJS scripts in `db/` handle schema creation and seeding (they run directly with Node, outside the Next.js bundler).

**Tech Stack:** Next.js 15, Tailwind CSS, next-intl@3, better-sqlite3

## Global Constraints
- JavaScript only — no TypeScript
- Default locale: `bg`; secondary: `en`
- `DATABASE_PATH` env var drives the DB path — never hardcode `/data/shop.db`
- No images in `public/img/` — `.gitkeep` files only
- Admin routes (`/admin/*`) are NOT locale-prefixed
- No payment processors of any kind

---

## File Map

| File | Role |
|---|---|
| `package.json` | After create-next-app: add `better-sqlite3`, `next-intl@3` |
| `next.config.mjs` | next-intl plugin wrapper + `serverExternalPackages: ['better-sqlite3']` |
| `.gitignore` | Excludes node_modules, .next, .env.local, /data/ |
| `.env.local` | `DATABASE_PATH=./data/shop.db` (gitignored) |
| `middleware.js` | next-intl locale routing (excludes /api, /admin, /_next, static files) |
| `i18n/request.js` | next-intl server request config — loads messages per locale |
| `messages/bg.json` | Bulgarian UI strings (nav keys for skeleton) |
| `messages/en.json` | English UI strings |
| `app/layout.js` | Root layout: `<html lang="bg"><body>{children}</body></html>` |
| `app/[locale]/layout.js` | Locale layout: NextIntlClientProvider + Header wrapping children |
| `app/[locale]/page.js` | Home placeholder |
| `app/[locale]/shop/page.js` | Shop placeholder |
| `app/[locale]/shop/[id]/page.js` | Product detail placeholder |
| `app/[locale]/cart/page.js` | Cart placeholder |
| `app/[locale]/checkout/page.js` | Checkout placeholder |
| `app/[locale]/order-confirmation/page.js` | Order confirmation placeholder |
| `app/[locale]/wholesale/page.js` | Wholesale inquiry placeholder |
| `app/[locale]/about/page.js` | About placeholder |
| `app/[locale]/contact/page.js` | Contact placeholder |
| `app/admin/layout.js` | Admin layout (no locale, no header) |
| `app/admin/login/page.js` | Admin login placeholder |
| `app/admin/orders/page.js` | Admin orders placeholder |
| `app/admin/wholesale/page.js` | Admin wholesale placeholder |
| `app/api/products/route.js` | GET /api/products stub → `{products:[]}` |
| `app/api/products/[id]/route.js` | GET /api/products/[id] stub |
| `app/api/orders/route.js` | GET /api/orders stub → `{orders:[]}` |
| `app/api/wholesale/route.js` | GET /api/wholesale stub → `{inquiries:[]}` |
| `components/Header.js` | Async Server Component — nav links + LanguageToggle |
| `components/LanguageToggle.js` | `'use client'` — swaps locale prefix in current pathname |
| `lib/db.js` | Singleton better-sqlite3 instance (ESM, used by Next.js app code) |
| `db/schema.js` | SQL DDL as a CommonJS export string |
| `db/init.js` | Standalone CJS script — creates tables from schema |
| `db/seed.js` | Standalone CJS script — inserts 3 sample products |
| `public/img/products/.gitkeep` | Empty tracked placeholder |
| `public/img/hero/.gitkeep` | Empty tracked placeholder |
| `public/img/brand/.gitkeep` | Empty tracked placeholder |

---

### Task 1: Initialize project, git, and dependencies

**Files:**
- Create: standard Next.js scaffold (via create-next-app)
- Modify: `next.config.mjs`
- Create: `.gitignore`, `.env.local`

- [ ] **Step 1: Run create-next-app**

Run from `C:\Users\bobel\Desktop\ClaudeTestProject\MeadShop`:

```bash
npx create-next-app@latest . --js --app --tailwind --eslint --no-src-dir --import-alias "@/*" --use-npm --yes
```

Expected: `Success! Created app at ...` — `package.json`, `app/`, `public/`, `tailwind.config.js`, etc. appear. The existing `CLAUDE.md` and `img/` are untouched.

If create-next-app refuses the non-empty directory: answer `y` at the "proceed anyway?" prompt, or omit `--yes` and answer interactively.

> **Windows note:** `better-sqlite3` (installed next) is a native Node addon requiring C++ build tools. If the install fails with node-gyp errors, install them first:
> `npm install --global windows-build-tools`
> Or via Visual Studio Installer → "Desktop development with C++" workload.

- [ ] **Step 2: Install extra dependencies**

```bash
npm install next-intl@3 better-sqlite3
```

Expected: both packages appear in `package.json` dependencies.

- [ ] **Step 3: Replace next.config.mjs**

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Create .env.local**

```
DATABASE_PATH=./data/shop.db
```

- [ ] **Step 5: Create .gitignore**

```
# dependencies
/node_modules/

# next.js
/.next/
/out/

# env files
.env.local
.env*.local

# db runtime data (created at runtime, not source)
/data/

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 6: Delete default Next.js placeholder files**

Delete `app/page.js` (the Next.js welcome page — replaced by `app/[locale]/page.js` in Task 2).
Delete `public/next.svg` and `public/vercel.svg` (default SVGs).

- [ ] **Step 7: Initialize git and make initial commit**

```bash
git init
git add CLAUDE.md img/ .gitignore next.config.mjs package.json package-lock.json tailwind.config.js postcss.config.mjs app/globals.css app/layout.js .eslintrc.json
git commit -m "chore: initialize Next.js 15 project with Tailwind"
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`. You'll get a 404 (we deleted the default page — that's fine). No compilation errors in the terminal. Stop with Ctrl+C.

---

### Task 2: Set up next-intl and [locale] routing

**Files:**
- Create: `middleware.js`, `i18n/request.js`, `messages/bg.json`, `messages/en.json`
- Modify: `app/layout.js`
- Create: `app/[locale]/layout.js`, `app/[locale]/page.js`

- [ ] **Step 1: Create middleware.js (project root)**

```javascript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['bg', 'en'],
  defaultLocale: 'bg',
});

export const config = {
  // Match all paths except /api/*, /admin/*, /_next/*, and static files (contain a dot)
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
```

- [ ] **Step 2: Create i18n/request.js**

```javascript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

> If you get a TypeScript/runtime error about `locale` being undefined, your installed next-intl version uses the newer `requestLocale` API. Replace the callback with:
> ```javascript
> async ({ requestLocale }) => {
>   const locale = await requestLocale;
>   return { locale, messages: (await import(`../messages/${locale}.json`)).default };
> }
> ```

- [ ] **Step 3: Create messages/bg.json**

```json
{
  "nav": {
    "home": "Начало",
    "shop": "Магазин",
    "wholesale": "Едро",
    "about": "За нас",
    "contact": "Контакти",
    "cart": "Количка"
  }
}
```

- [ ] **Step 4: Create messages/en.json**

```json
{
  "nav": {
    "home": "Home",
    "shop": "Shop",
    "wholesale": "Wholesale",
    "about": "About",
    "contact": "Contact",
    "cart": "Cart"
  }
}
```

- [ ] **Step 5: Replace app/layout.js**

```javascript
import './globals.css';

export const metadata = {
  title: 'Мед & Медовина',
  description: 'Онлайн магазин за мед и медовина',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
```

Note: `lang="bg"` is a static placeholder for the skeleton. The locale layout will own this dynamically when built out.

- [ ] **Step 6: Create app/[locale]/layout.js**

```javascript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
```

Note: Header is added here in Task 3.

- [ ] **Step 7: Create app/[locale]/page.js**

```javascript
export default function HomePage() {
  return <p>Home — coming soon.</p>;
}
```

- [ ] **Step 8: Verify locale routing**

```bash
npm run dev
```

Check:
- `http://localhost:3000` — redirects to `http://localhost:3000/bg`
- `http://localhost:3000/bg` — shows "Home — coming soon."
- `http://localhost:3000/en` — shows "Home — coming soon."
- `http://localhost:3000/admin/login` — shows 404 (admin page not created yet; correct — middleware skips /admin)

Expected: no console errors about missing messages.

- [ ] **Step 9: Commit**

```bash
git add middleware.js i18n/ messages/ app/layout.js app/[locale]/
git commit -m "feat: add next-intl i18n with bg/en locales and [locale] routing"
```

---

### Task 3: Header with LanguageToggle

**Files:**
- Create: `components/LanguageToggle.js`, `components/Header.js`
- Modify: `app/[locale]/layout.js`

- [ ] **Step 1: Create components/LanguageToggle.js**

```javascript
'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'bg' ? 'en' : 'bg';
  // Swap the locale segment: /bg/shop → /en/shop
  const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <a href={newPath} className="text-sm font-semibold underline">
      {otherLocale.toUpperCase()}
    </a>
  );
}
```

- [ ] **Step 2: Create components/Header.js**

```javascript
import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default async function Header() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  return (
    <header className="border-b py-4 px-6 flex items-center justify-between">
      <Link href={`/${locale}`} className="font-bold text-lg">
        Мед &amp; Медовина
      </Link>
      <nav className="flex gap-6 items-center text-sm">
        <Link href={`/${locale}/shop`}>{t('shop')}</Link>
        <Link href={`/${locale}/wholesale`}>{t('wholesale')}</Link>
        <Link href={`/${locale}/about`}>{t('about')}</Link>
        <Link href={`/${locale}/contact`}>{t('contact')}</Link>
        <Link href={`/${locale}/cart`}>{t('cart')}</Link>
        <LanguageToggle />
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Add Header to app/[locale]/layout.js**

```javascript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/Header';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 4: Verify header and language toggle**

```bash
npm run dev
```

Visit `http://localhost:3000/bg`:
- Header shows "Мед & Медовина" and nav links in Bulgarian
- "EN" link is visible in the header

Click "EN":
- URL changes to `http://localhost:3000/en`
- Nav links are now in English: Shop, Wholesale, About, Contact, Cart
- "BG" link is visible

Click "BG":
- Returns to `http://localhost:3000/bg` with Bulgarian nav

- [ ] **Step 5: Commit**

```bash
git add components/ app/[locale]/layout.js
git commit -m "feat: add Header with LanguageToggle for locale switching"
```

---

### Task 4: Database layer

**Files:**
- Create: `db/schema.js`, `db/init.js`, `db/seed.js`, `lib/db.js`

Note on module formats: `db/*.js` scripts run directly with Node (outside Next.js bundler) so they use CommonJS (`require`). `lib/db.js` is imported by Next.js app code, so it uses ES module `import/export`.

- [ ] **Step 1: Create db/schema.js**

```javascript
const schema = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_bg TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('honey', 'mead')),
    variant TEXT,
    price_bgn REAL NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    description_bg TEXT,
    description_en TEXT,
    image_path TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    delivery_method TEXT NOT NULL CHECK(delivery_method IN ('ekont_office', 'ekont_door', 'speedy_office', 'speedy_door')),
    address_or_office TEXT NOT NULL,
    city TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    qty INTEGER NOT NULL,
    unit_price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wholesale_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    estimated_volume TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

module.exports = { schema };
```

- [ ] **Step 2: Create db/init.js**

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { schema } = require('./schema');

const dbPath = process.env.DATABASE_PATH || './data/shop.db';
const resolved = path.resolve(dbPath);
const dir = path.dirname(resolved);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(resolved);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(schema);
db.close();

console.log('Database initialized at', resolved);
```

- [ ] **Step 3: Create db/seed.js**

```javascript
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './data/shop.db';
const db = new Database(path.resolve(dbPath));

const insert = db.prepare(`
  INSERT INTO products (name_bg, name_en, category, variant, price_bgn, stock_qty,
                        description_bg, description_en, active)
  VALUES (@name_bg, @name_en, @category, @variant, @price_bgn, @stock_qty,
          @description_bg, @description_en, @active)
`);

const seed = db.transaction(() => {
  insert.run({
    name_bg: 'Липов мед', name_en: 'Linden Honey',
    category: 'honey', variant: '700г',
    price_bgn: 18.00, stock_qty: 50,
    description_bg: 'Чист липов мед от горски пчелини.',
    description_en: 'Pure linden honey from forest apiaries.',
    active: 1,
  });
  insert.run({
    name_bg: 'Липов мед', name_en: 'Linden Honey',
    category: 'honey', variant: '240г',
    price_bgn: 8.00, stock_qty: 80,
    description_bg: 'Чист липов мед от горски пчелини.',
    description_en: 'Pure linden honey from forest apiaries.',
    active: 1,
  });
  insert.run({
    name_bg: 'Традиционна медовина', name_en: 'Traditional Mead',
    category: 'mead', variant: '750мл',
    price_bgn: 32.00, stock_qty: 30,
    description_bg: 'Ферментирала медовина по традиционна рецепта.',
    description_en: 'Fermented mead made with a traditional recipe.',
    active: 1,
  });
});

seed();
db.close();
console.log('Seeded 3 products.');
```

- [ ] **Step 4: Create lib/db.js**

```javascript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH;
if (!dbPath) throw new Error('DATABASE_PATH env var is not set');

const db = new Database(path.resolve(dbPath));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
```

- [ ] **Step 5: Add db scripts to package.json**

In `package.json`, add to the `"scripts"` object:

```json
"db:init": "node db/init.js",
"db:seed": "node db/seed.js"
```

- [ ] **Step 6: Run init and seed**

```bash
npm run db:init
npm run db:seed
```

Expected output:
```
Database initialized at C:\...\MeadShop\data\shop.db
Seeded 3 products.
```

- [ ] **Step 7: Verify tables**

```bash
node -e "const db = require('better-sqlite3')('./data/shop.db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=?').all('table').map(r=>r.name));"
```

Expected: `[ 'products', 'orders', 'order_items', 'wholesale_inquiries' ]`

- [ ] **Step 8: Commit**

```bash
git add db/ lib/ package.json package-lock.json
git commit -m "feat: add SQLite schema, init/seed scripts, and db singleton"
```

---

### Task 5: Scaffold all pages, API stubs, and image folders

**Files:** All remaining pages, admin routes, API stubs, and `.gitkeep` files.

- [ ] **Step 1: Create public image folders with .gitkeep**

Create three empty files:
- `public/img/products/.gitkeep`
- `public/img/hero/.gitkeep`
- `public/img/brand/.gitkeep`

Each file is completely empty (0 bytes). Do not add any image files.

- [ ] **Step 2: Create locale page placeholders**

`app/[locale]/shop/page.js`:
```javascript
export default function ShopPage() {
  return <p>Shop — coming soon.</p>;
}
```

`app/[locale]/shop/[id]/page.js`:
```javascript
export default function ProductPage() {
  return <p>Product detail — coming soon.</p>;
}
```

`app/[locale]/cart/page.js`:
```javascript
export default function CartPage() {
  return <p>Cart — coming soon.</p>;
}
```

`app/[locale]/checkout/page.js`:
```javascript
export default function CheckoutPage() {
  return <p>Checkout — coming soon.</p>;
}
```

`app/[locale]/order-confirmation/page.js`:
```javascript
export default function OrderConfirmationPage() {
  return <p>Order confirmed — coming soon.</p>;
}
```

`app/[locale]/wholesale/page.js`:
```javascript
export default function WholesalePage() {
  return <p>Wholesale inquiry — coming soon.</p>;
}
```

`app/[locale]/about/page.js`:
```javascript
export default function AboutPage() {
  return <p>About — coming soon.</p>;
}
```

`app/[locale]/contact/page.js`:
```javascript
export default function ContactPage() {
  return <p>Contact — coming soon.</p>;
}
```

- [ ] **Step 3: Create admin layout and pages**

`app/admin/layout.js`:
```javascript
export default function AdminLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
```

Note: Admin has its own root layout because it bypasses the locale layout tree.

`app/admin/login/page.js`:
```javascript
export default function AdminLoginPage() {
  return <p>Admin login — coming soon.</p>;
}
```

`app/admin/orders/page.js`:
```javascript
export default function AdminOrdersPage() {
  return <p>Admin orders — coming soon.</p>;
}
```

`app/admin/wholesale/page.js`:
```javascript
export default function AdminWholesalePage() {
  return <p>Admin wholesale — coming soon.</p>;
}
```

- [ ] **Step 4: Create API route stubs**

`app/api/products/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ products: [] });
}
```

`app/api/products/[id]/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  return NextResponse.json({ product: null, id });
}
```

`app/api/orders/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ orders: [] });
}
```

`app/api/wholesale/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ inquiries: [] });
}
```

- [ ] **Step 5: Verify all routes**

```bash
npm run dev
```

Check every route returns the expected response:

| URL | Expected |
|-----|----------|
| `http://localhost:3000` | Redirects to `/bg` |
| `http://localhost:3000/bg` | "Home — coming soon." with header |
| `http://localhost:3000/en` | "Home — coming soon." with header (English nav) |
| `http://localhost:3000/bg/shop` | "Shop — coming soon." |
| `http://localhost:3000/bg/shop/1` | "Product detail — coming soon." |
| `http://localhost:3000/bg/cart` | "Cart — coming soon." |
| `http://localhost:3000/bg/checkout` | "Checkout — coming soon." |
| `http://localhost:3000/bg/order-confirmation` | "Order confirmed — coming soon." |
| `http://localhost:3000/bg/wholesale` | "Wholesale inquiry — coming soon." |
| `http://localhost:3000/bg/about` | "About — coming soon." |
| `http://localhost:3000/bg/contact` | "Contact — coming soon." |
| `http://localhost:3000/admin/login` | "Admin login — coming soon." (no locale header) |
| `http://localhost:3000/admin/orders` | "Admin orders — coming soon." |
| `http://localhost:3000/admin/wholesale` | "Admin wholesale — coming soon." |
| `http://localhost:3000/api/products` | `{"products":[]}` |
| `http://localhost:3000/api/products/1` | `{"product":null,"id":"1"}` |
| `http://localhost:3000/api/orders` | `{"orders":[]}` |
| `http://localhost:3000/api/wholesale` | `{"inquiries":[]}` |

Also verify: language toggle on `/bg/shop` navigates to `/en/shop` (not just `/en`).

- [ ] **Step 6: Final commit**

```bash
git add app/ public/ docs/
git commit -m "feat: scaffold all locale pages, admin pages, API stubs, and image folders"
```

---

## Self-Review

**Spec coverage:**
- ✅ Next.js App Router, Tailwind CSS, JavaScript only (Task 1)
- ✅ Git repo + .gitignore for Next.js (Task 1)
- ✅ next-intl with bg/en, `[locale]` segment, locale toggle in header (Tasks 2–3)
- ✅ SQLite schema matching CLAUDE.md data model, seed script, `db/init.js` (Task 4)
- ✅ `DATABASE_PATH` env var, never hardcoded to `/data/shop.db` (Tasks 1, 4)
- ✅ Empty image folders with `.gitkeep`, no placeholder images (Task 5)
- ✅ All routes from CLAUDE.md scaffolded (Task 5)
- ✅ Hard rules: no payment integration, no TypeScript, orders created as `pending`

**Placeholder scan:** No TBDs or "implement later" in any step — all steps include concrete code or commands with expected output.

**Consistency check:**
- `db/schema.js` uses `module.exports` → `db/init.js` and `db/seed.js` use `require()` ✅
- `lib/db.js` uses `import/export` (Next.js compiles it) ✅
- All page paths match CLAUDE.md exactly (including `/order-confirmation` not `/order-confirmation/[id]`) ✅
- All four DB tables match CLAUDE.md data model field-for-field ✅
- Admin routes (`/admin/login`, `/admin/orders`, `/admin/wholesale`) are NOT under `[locale]` ✅
- Middleware matcher excludes `/admin/*` from locale routing ✅
