'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { updateStatus } from '@/lib/adminActions';
import { requireAdmin } from '@/lib/adminSession';
import { createWaybill } from '@/lib/econt';
import { sendOrderStatusEmail } from '@/lib/email';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function updateOrderStatus(orderId, formData) {
  await requireAdmin();
  const newStatus = formData.get('newStatus')?.toString() ?? '';
  updateStatus('orders', VALID_STATUSES, '/admin/orders', orderId, formData);

  if (['confirmed', 'shipped'].includes(newStatus)) {
    const order = db.prepare('SELECT customer_name, email, econt_shipment_number FROM orders WHERE id = ?').get(orderId);
    if (order?.email) {
      sendOrderStatusEmail({
        orderId,
        customerName: order.customer_name,
        email: order.email,
        status: newStatus,
        shipmentNumber: order.econt_shipment_number,
      }).catch(() => {});
    }
  }
}

export async function createEcontWaybill(orderId, prevState) {
  await requireAdmin();
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) return { error: 'Order not found' };
    if (!['ekont_office', 'ekont_door'].includes(order.delivery_method)) {
      return { error: 'Not an Econt order' };
    }
    if (order.econt_shipment_number) return { error: 'Waybill already created' };

    const items = db.prepare(`
      SELECT oi.qty, p.weight_kg
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(orderId);

    const totalWeight = items.reduce((sum, i) => sum + i.weight_kg * i.qty, 0);
    const { shipmentNumber, pdfUrl } = await createWaybill(order, totalWeight);

    db.prepare(
      'UPDATE orders SET econt_shipment_number = ?, econt_waybill_url = ? WHERE id = ?'
    ).run(shipmentNumber, pdfUrl, orderId);
  } catch (err) {
    return { error: err.message ?? 'Failed to create waybill' };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}
