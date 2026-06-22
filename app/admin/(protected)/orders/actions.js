'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function updateOrderStatus(orderId, formData) {
  const newStatus = formData.get('newStatus')?.toString() ?? '';
  if (!VALID_STATUSES.includes(newStatus)) return;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, orderId);
  revalidatePath('/admin/orders');
}
