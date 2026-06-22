'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

const VALID_STATUSES = ['new', 'contacted', 'closed'];

export async function updateWholesaleStatus(inquiryId, formData) {
  const newStatus = formData.get('newStatus')?.toString() ?? '';
  if (!VALID_STATUSES.includes(newStatus)) return;
  db.prepare('UPDATE wholesale_inquiries SET status = ? WHERE id = ?').run(newStatus, inquiryId);
  revalidatePath('/admin/wholesale');
}
