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
    email: email || '',
    message,
  });

  return { success: true };
}
