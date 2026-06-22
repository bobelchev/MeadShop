'use server';

import db from '@/lib/db';

export async function createWholesaleInquiry(prevState, formData) {
  const company_name = formData.get('company_name')?.toString().trim() ?? '';
  const contact_name = formData.get('contact_name')?.toString().trim() ?? '';
  const phone = formData.get('phone')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim() ?? '';
  const message = formData.get('message')?.toString().trim() ?? '';
  const estimated_volume = formData.get('estimated_volume')?.toString().trim() ?? '';

  if (!company_name || !contact_name || !phone) {
    return { error: 'error_required' };
  }

  db.prepare(`
    INSERT INTO wholesale_inquiries (company_name, contact_name, phone, email, message, estimated_volume, status)
    VALUES (@company_name, @contact_name, @phone, @email, @message, @estimated_volume, 'new')
  `).run({
    company_name,
    contact_name,
    phone,
    email: email || null,
    message: message || null,
    estimated_volume: estimated_volume || null,
  });

  return { success: true };
}
