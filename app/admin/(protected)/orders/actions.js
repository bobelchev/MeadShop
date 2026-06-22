'use server';

import { updateStatus } from '@/lib/adminActions';
import { requireAdmin } from '@/lib/adminSession';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function updateOrderStatus(orderId, formData) {
  await requireAdmin();
  updateStatus('orders', VALID_STATUSES, '/admin/orders', orderId, formData);
}
