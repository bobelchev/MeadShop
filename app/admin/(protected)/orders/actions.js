'use server';

import { updateStatus } from '@/lib/adminActions';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function updateOrderStatus(orderId, formData) {
  updateStatus('orders', VALID_STATUSES, '/admin/orders', orderId, formData);
}
