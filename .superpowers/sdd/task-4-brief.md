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

