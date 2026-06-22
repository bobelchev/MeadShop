# Shop Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the shop by adding stock deduction on checkout, an admin order detail view, and a wholesale page product picker.

**Architecture:** All changes are server-side SQLite + Next.js Server Actions / Server Components. No new dependencies. The wholesale product picker is a Client Component that serializes selections into a hidden JSON field before submit.

**Tech Stack:** Next.js 16 App Router, React 19, better-sqlite3, next-intl v4, Tailwind CSS.

## Global Constraints

- No test runner — verify every task by running `npm run dev` and checking in browser at `http://localhost:3000`
- Admin UI is English-only, no next-intl
- All customer-facing strings go through next-intl (both `messages/bg.json` and `messages/en.json`)
- Use existing Tailwind design tokens: `honey-*`, `mead-*`, `cream-*`, `bark-*`, `stone-*`
- Use existing component classes: `btn-primary`, `btn-secondary`, `card-product`, `section`, `section-narrow`, `ornament-rule`
- SQLite is accessed only via `lib/db.js` singleton — never `new Database()` directly
- `lib/db.js` already sets WAL, foreign_keys ON, and runs schema — do not repeat these
- Locale routing: default `bg`, secondary `en`. Pages live under `app/[locale]/`
- Server Actions must have `'use server'` at top; client components must have `'use client'` at top
- `proxy.js` is middleware (Next.js 16 renamed it from `middleware.js`) — do not create `middleware.js`

---

### Task 1: Stock deduction on checkout

**Files:**
- Modify: `app/[locale]/checkout/actions.js`

**Interfaces:**
- Consumes: existing `createOrder()` server action and its transaction
- Produces: stock_qty is decremented atomically with order insert

- [ ] **Step 1: Add stock deduction inside the existing transaction**

In `app/[locale]/checkout/actions.js`, add one prepared statement and run it inside `createOrderTx`. The full updated transaction block (lines 66–82):

```js
const insertOrder = db.prepare(`
  INSERT INTO orders (customer_name, phone, email, delivery_method, address_or_office, city, notes, status, total_amount)
  VALUES (@customer_name, @phone, @email, @delivery_method, @address_or_office, @city, @notes, 'pending', @total_amount)
`);
const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, qty, unit_price)
  VALUES (@order_id, @product_id, @qty, @unit_price)
`);
const deductStock = db.prepare(
  'UPDATE products SET stock_qty = MAX(0, stock_qty - ?) WHERE id = ?'
);

const createOrderTx = db.transaction(() => {
  const result = insertOrder.run({
    customer_name,
    phone,
    email: email || null,
    delivery_method,
    address_or_office,
    city,
    notes: notes || null,
    total_amount,
  });
  const order_id = result.lastInsertRowid;
  for (const item of verifiedItems) {
    insertItem.run({ order_id, ...item });
    deductStock.run(item.qty, item.product_id);
  }
  return order_id;
});
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Add a product to cart, go to checkout, place an order. Then in the admin at `/admin/products`, confirm that product's stock qty decreased by the quantity ordered.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/checkout/actions.js
git commit -m "feat: deduct stock_qty atomically when order is placed"
```

---

### Task 2: Admin order detail view

**Files:**
- Create: `app/admin/(protected)/orders/[id]/page.js`
- Modify: `app/admin/(protected)/orders/page.js` — make order rows linkable

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `order_items` joined with `products`
- Produces: page at `/admin/orders/[id]` showing customer info + line items

- [ ] **Step 1: Create the detail page**

Create `app/admin/(protected)/orders/[id]/page.js`:

```js
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';

const DELIVERY_LABELS = {
  ekont_office: 'Ekont — office pickup',
  ekont_door: 'Ekont — door delivery',
  speedy_office: 'Speedy — office pickup',
  speedy_door: 'Speedy — door delivery',
};

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) notFound();

  const items = db.prepare(`
    SELECT oi.qty, oi.unit_price, p.name_bg, p.name_en, p.category
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(id);

  return (
    <div className="max-w-2xl">
      <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to orders
      </a>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Order #{order.id}</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
          {order.status}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-sm space-y-1">
        <p><span className="text-gray-500 w-32 inline-block">Customer</span> <span className="font-medium text-gray-800">{order.customer_name}</span></p>
        <p><span className="text-gray-500 w-32 inline-block">Phone</span> {order.phone}</p>
        {order.email && <p><span className="text-gray-500 w-32 inline-block">Email</span> {order.email}</p>}
        <p><span className="text-gray-500 w-32 inline-block">Delivery</span> {DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}</p>
        <p><span className="text-gray-500 w-32 inline-block">Address</span> {order.address_or_office}</p>
        <p><span className="text-gray-500 w-32 inline-block">City</span> {order.city}</p>
        {order.notes && <p><span className="text-gray-500 w-32 inline-block">Notes</span> {order.notes}</p>}
        <p><span className="text-gray-500 w-32 inline-block">Date</span> {new Date(order.created_at).toLocaleString('bg-BG')}</p>
      </div>

      <h2 className="text-base font-semibold text-gray-800 mb-2">Items</h2>
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-600">
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Unit price</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-800">{item.name_bg}</td>
              <td className="py-2 pr-4 text-gray-500">{item.category}</td>
              <td className="py-2 pr-4 text-gray-700">{item.qty}</td>
              <td className="py-2 pr-4 text-gray-700">{Number(item.unit_price).toFixed(2)} BGN</td>
              <td className="py-2 text-right text-gray-800">{(item.qty * item.unit_price).toFixed(2)} BGN</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="py-3 pr-4 text-right font-semibold text-gray-700">Total</td>
            <td className="py-3 text-right font-bold text-gray-900">{Number(order.total_amount).toFixed(2)} BGN</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Make order rows in the list clickable**

In `app/admin/(protected)/orders/page.js`, wrap the customer name cell in a link. Replace the customer name `<td>`:

```js
<td className="py-3 pr-4 font-medium text-gray-800">
  <a href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
    {order.customer_name}
  </a>
</td>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Go to `/admin/orders`. Click a customer name — should open the detail page with line items. If no orders exist, place one via checkout first.

- [ ] **Step 4: Commit**

```bash
git add "app/admin/(protected)/orders/[id]/page.js" "app/admin/(protected)/orders/page.js"
git commit -m "feat: add order detail view in admin with line items"
```

---

### Task 3: Wholesale i18n strings update

**Files:**
- Modify: `messages/bg.json`
- Modify: `messages/en.json`

**Interfaces:**
- Produces: new keys used by Task 4's WholesaleForm

- [ ] **Step 1: Update `messages/bg.json` wholesale namespace**

Replace the entire `"wholesale"` block with:

```json
"wholesale": {
  "meta_title": "Търговия на едро — Пчелин Мед",
  "meta_description": "Запитване за търговия на едро с мед и медовина.",
  "heading": "Запитване на едро",
  "subheading": "За корпоративни клиенти и търговци — свържете се с нас за условия.",
  "company_label": "Фирма",
  "contact_label": "Лице за контакт",
  "phone_label": "Телефон",
  "email_label": "E-mail (незадължително)",
  "products_heading": "Изберете продукти",
  "products_subheading": "Добавете продуктите, за които се интересувате, и посочете желаното количество.",
  "product_add": "Добави",
  "product_remove": "Премахни",
  "qty_label": "Количество (бр.)",
  "note_placeholder": "Въпрос за този продукт... (незадължително)",
  "no_products": "Все още не сте избрали продукти.",
  "submit": "Изпрати запитване",
  "submitting": "Изпращане...",
  "success_heading": "Получихме вашето запитване!",
  "success_body": "Ще се свържем с вас в рамките на 1–2 работни дни.",
  "error_required": "Моля, попълнете задължителните полета (фирма, лице за контакт, телефон).",
  "error_no_products": "Моля, изберете поне един продукт."
}
```

- [ ] **Step 2: Update `messages/en.json` wholesale namespace**

Replace the entire `"wholesale"` block with:

```json
"wholesale": {
  "meta_title": "Wholesale — Pchelin Med",
  "meta_description": "Wholesale inquiry for honey and mead.",
  "heading": "Wholesale Inquiry",
  "subheading": "For businesses and retailers — get in touch for wholesale pricing.",
  "company_label": "Company",
  "contact_label": "Contact person",
  "phone_label": "Phone",
  "email_label": "E-mail (optional)",
  "products_heading": "Select products",
  "products_subheading": "Add the products you are interested in and specify the desired quantity.",
  "product_add": "Add",
  "product_remove": "Remove",
  "qty_label": "Quantity (units)",
  "note_placeholder": "Question about this product... (optional)",
  "no_products": "You haven't selected any products yet.",
  "submit": "Send inquiry",
  "submitting": "Sending...",
  "success_heading": "Inquiry received!",
  "success_body": "We will contact you within 1–2 business days.",
  "error_required": "Please fill in the required fields (company, contact person, phone).",
  "error_no_products": "Please select at least one product."
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/bg.json messages/en.json
git commit -m "feat: update wholesale i18n strings for product picker"
```

---

### Task 4: Wholesale product picker

**Files:**
- Modify: `app/[locale]/wholesale/page.js` — fetch active products, pass to form
- Modify: `app/[locale]/wholesale/WholesaleForm.js` — add product picker UI
- Modify: `app/[locale]/wholesale/actions.js` — decode product selections into message

**Interfaces:**
- Consumes: i18n keys from Task 3; products array `{id, name_bg, name_en, category, price_bgn}[]`
- Produces: wholesale inquiry saved with serialized product selections in `message` field

- [ ] **Step 1: Update `page.js` to fetch products and pass them to the form**

Replace `app/[locale]/wholesale/page.js` entirely:

```js
import { getTranslations } from 'next-intl/server';
import db from '@/lib/db';
import WholesaleForm from './WholesaleForm';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meadshop.bg';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wholesale' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: `${SITE_URL}/${locale}/wholesale` },
  };
}

export default async function WholesalePage() {
  const t = await getTranslations('wholesale');
  const products = db
    .prepare('SELECT id, name_bg, name_en, category, price_bgn FROM products WHERE active = 1 ORDER BY category, name_bg')
    .all();

  return (
    <section className="section">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-display font-bold text-bark-900 mb-2">{t('heading')}</h1>
        <p className="text-bark-600 mb-8">{t('subheading')}</p>
        <WholesaleForm products={products} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `WholesaleForm.js` with product picker**

Replace `app/[locale]/wholesale/WholesaleForm.js` entirely:

```js
'use client';

import { useActionState, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createWholesaleInquiry } from './actions';

export default function WholesaleForm({ products }) {
  const t = useTranslations('wholesale');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(createWholesaleInquiry, null);
  const [selections, setSelections] = useState([]);

  function addProduct(product) {
    if (selections.find((s) => s.id === product.id)) return;
    setSelections((prev) => [...prev, { id: product.id, name: locale === 'en' ? product.name_en : product.name_bg, qty: 1, note: '' }]);
  }

  function removeProduct(id) {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateQty(id, qty) {
    const n = Math.max(1, parseInt(qty) || 1);
    setSelections((prev) => prev.map((s) => s.id === id ? { ...s, qty: n } : s));
  }

  function updateNote(id, note) {
    setSelections((prev) => prev.map((s) => s.id === id ? { ...s, note } : s));
  }

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-display font-bold text-bark-900 mb-3">{t('success_heading')}</h2>
        <p className="text-bark-700">{t('success_body')}</p>
      </div>
    );
  }

  const selectedIds = new Set(selections.map((s) => s.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Left: contact form */}
      <form action={formAction} className="space-y-5">
        {state?.error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {t(state.error)}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1">{t('company_label')} *</label>
          <input name="company_name" type="text" required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1">{t('contact_label')} *</label>
          <input name="contact_name" type="text" required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1">{t('phone_label')} *</label>
          <input name="phone" type="tel" required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1">{t('email_label')}</label>
          <input name="email" type="email" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
        </div>

        {/* Serialized product selections */}
        <input type="hidden" name="product_selections" value={JSON.stringify(selections)} />

        {/* Selected products summary */}
        {selections.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="ornament-rule" />
            {selections.map((s) => (
              <div key={s.id} className="border border-stone-200 rounded-lg p-3 bg-cream-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-bark-800">{s.name}</span>
                  <button type="button" onClick={() => removeProduct(s.id)} className="text-xs text-red-500 hover:text-red-700">
                    {t('product_remove')}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-bark-600 shrink-0">{t('qty_label')}</label>
                  <input
                    type="number"
                    min="1"
                    value={s.qty}
                    onChange={(e) => updateQty(s.id, e.target.value)}
                    className="w-20 border border-stone-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400"
                  />
                </div>
                <input
                  type="text"
                  value={s.note}
                  onChange={(e) => updateNote(s.id, e.target.value)}
                  placeholder={t('note_placeholder')}
                  className="w-full border border-stone-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400"
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? t('submitting') : t('submit')}
        </button>
      </form>

      {/* Right: product picker */}
      <div>
        <h2 className="text-lg font-display font-semibold text-bark-900 mb-1">{t('products_heading')}</h2>
        <p className="text-sm text-bark-600 mb-4">{t('products_subheading')}</p>

        {products.length === 0 ? (
          <p className="text-sm text-stone-500">{t('no_products')}</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => {
              const name = locale === 'en' ? p.name_en : p.name_bg;
              const added = selectedIds.has(p.id);
              return (
                <div key={p.id} className={`flex items-center justify-between border rounded-lg px-4 py-3 transition-colors ${added ? 'border-honey-400 bg-honey-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                  <div>
                    <p className="text-sm font-medium text-bark-800">{name}</p>
                    <p className="text-xs text-stone-500">{p.category} · {Number(p.price_bgn).toFixed(2)} лв.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduct(p)}
                    disabled={added}
                    className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${added ? 'bg-honey-200 text-honey-700 cursor-default' : 'bg-bark-700 text-white hover:bg-bark-800'}`}
                  >
                    {added ? '✓' : t('product_add')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update the server action to decode selections**

Replace `app/[locale]/wholesale/actions.js` entirely:

```js
'use server';

import db from '@/lib/db';

export async function createWholesaleInquiry(prevState, formData) {
  const company_name = formData.get('company_name')?.toString().trim() ?? '';
  const contact_name = formData.get('contact_name')?.toString().trim() ?? '';
  const phone = formData.get('phone')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim() ?? '';
  const selectionsRaw = formData.get('product_selections')?.toString() ?? '[]';

  if (!company_name || !contact_name || !phone) {
    return { error: 'error_required' };
  }

  let selections;
  try {
    selections = JSON.parse(selectionsRaw);
  } catch {
    selections = [];
  }

  if (!Array.isArray(selections) || selections.length === 0) {
    return { error: 'error_no_products' };
  }

  const message = selections
    .map((s) => {
      const base = `${s.name} × ${s.qty}`;
      return s.note?.trim() ? `${base} [${s.note.trim()}]` : base;
    })
    .join(', ');

  db.prepare(`
    INSERT INTO wholesale_inquiries (company_name, contact_name, phone, email, message, status)
    VALUES (@company_name, @contact_name, @phone, @email, @message, 'new')
  `).run({
    company_name,
    contact_name,
    phone,
    email: email || null,
    message,
  });

  return { success: true };
}
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Go to `/bg/wholesale`. Confirm:
- Two-column layout (stacks on mobile)
- Product cards on the right with Add button
- Clicking Add moves product to selection on the left with qty + note fields
- Button turns to ✓ and is disabled after adding
- Remove button removes from selection
- Submit without selecting a product shows `error_no_products`
- Successful submit shows success message
- Check `/admin/wholesale` — inquiry appears with message like "Планинска акация × 10 [question], Медовина × 5"
- Switch to `/en/wholesale` and verify English strings

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/wholesale/page.js" "app/[locale]/wholesale/WholesaleForm.js" "app/[locale]/wholesale/actions.js"
git commit -m "feat: wholesale product picker with qty and per-product notes"
```

---

### Task 5: Drop orphaned image_path column

**Files:**
- Modify: `db/schema.js` — remove `image_path` column from products table

**Interfaces:**
- Consumes: nothing (column is never written or read by app code)
- Produces: clean schema without orphaned column

Note: SQLite supports `ALTER TABLE DROP COLUMN` since 3.35. The Railway runtime uses a recent SQLite version. The `CREATE TABLE IF NOT EXISTS` in schema.js won't remove the column from existing DBs — only fresh DBs get the clean schema. For existing Railway DB, run `ALTER TABLE products DROP COLUMN image_path;` manually via Railway's shell once. Local dev: delete `data/shop.db` and run `npm run db:init`.

- [ ] **Step 1: Remove `image_path` from `db/schema.js`**

In `db/schema.js`, find the products table definition and remove the `image_path TEXT,` line:

```js
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
    active INTEGER NOT NULL DEFAULT 1
  );
  ...rest unchanged...
`;
```

- [ ] **Step 2: Verify dev server starts without error**

Delete `data/shop.db`, run `npm run db:init && npm run db:seed`, then `npm run dev`. Confirm admin products page loads and images still work (they come from `product_images` table, not this column).

- [ ] **Step 3: Commit**

```bash
git add db/schema.js
git commit -m "chore: drop orphaned image_path column from products schema"
```

---

### Task 6: Final push

- [ ] **Step 1: Push all commits**

```bash
git push
```

- [ ] **Step 2: Confirm Railway deploys cleanly**

Watch the Railway deploy log. The `preDeployCommand = "npm run db:init"` will run `CREATE TABLE IF NOT EXISTS` — safe, idempotent.
