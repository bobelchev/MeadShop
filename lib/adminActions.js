import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

const ALLOWED_TABLES = new Set(['orders', 'wholesale_inquiries']);

export function updateStatus(table, validStatuses, revalidateUrl, rowId, formData) {
  if (!ALLOWED_TABLES.has(table)) return;
  const newStatus = formData.get('newStatus')?.toString() ?? '';
  if (!validStatuses.includes(newStatus)) return;
  db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(newStatus, rowId);
  revalidatePath(revalidateUrl);
}
