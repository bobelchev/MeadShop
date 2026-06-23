'use server';

import db from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { sendWholesaleNotification, sendWholesaleConfirmation } from '@/lib/email';

export async function createWholesaleInquiry(prevState, formData) {
  const locale = await getLocale();
  const company_name = formData.get('company_name')?.toString().trim().slice(0, 200) ?? '';
  const contact_name = formData.get('contact_name')?.toString().trim().slice(0, 200) ?? '';
  const phone = formData.get('phone')?.toString().trim().slice(0, 50) ?? '';
  const email = formData.get('email')?.toString().trim().slice(0, 200) ?? '';
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

  const ids = selections.map((s) => parseInt(s.id, 10)).filter(Boolean);
  const placeholders = ids.map(() => '?').join(',');
  const dbProducts = ids.length
    ? db.prepare(`SELECT id, name_bg FROM products WHERE id IN (${placeholders}) AND active = 1`).all(...ids)
    : [];
  const productMap = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

  const message = selections
    .filter((s) => productMap[parseInt(s.id, 10)])
    .map((s) => {
      const name = productMap[parseInt(s.id, 10)].name_bg;
      const qty = Math.max(1, parseInt(s.qty, 10) || 1);
      const note = s.note?.toString().trim().slice(0, 500) ?? '';
      const base = `${name} × ${qty}`;
      return note ? `${base} [${note}]` : base;
    })
    .join(', ');

  if (!message) return { error: 'error_no_products' };

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO wholesale_inquiries (company_name, contact_name, phone, email, message, status)
    VALUES (@company_name, @contact_name, @phone, @email, @message, 'new')
  `).run({
    company_name,
    contact_name,
    phone,
    email: email || '',
    message,
  });

  sendWholesaleNotification({
    inquiryId: lastInsertRowid,
    companyName: company_name,
    contactName: contact_name,
    phone,
    email,
    message,
  });

  if (email) {
    sendWholesaleConfirmation({ companyName: company_name, contactName: contact_name, email, message, locale });
  }

  return { success: true };
}
