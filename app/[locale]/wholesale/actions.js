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

  const ids = selections.map((s) => parseInt(s.id)).filter(Boolean);
  const placeholders = ids.map(() => '?').join(',');
  const dbProducts = ids.length
    ? db.prepare(`SELECT id, name_bg FROM products WHERE id IN (${placeholders}) AND active = 1`).all(...ids)
    : [];
  const productMap = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

  const message = selections
    .filter((s) => productMap[parseInt(s.id)])
    .map((s) => {
      const name = productMap[parseInt(s.id)].name_bg;
      const qty = Math.max(1, parseInt(s.qty) || 1);
      const note = s.note?.toString().trim().slice(0, 500) ?? '';
      const base = `${name} × ${qty}`;
      return note ? `${base} [${note}]` : base;
    })
    .join(', ');

  if (!message) return { error: 'error_no_products' };

  db.prepare(`
    INSERT INTO wholesale_inquiries (company_name, contact_name, phone, email, message, status)
    VALUES (@company_name, @contact_name, @phone, @email, @message, 'new')
  `).run({
    company_name,
    contact_name,
    phone,
    email: email || '',
    message,
  });

  return { success: true };
}
