'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { sendOrderNotification } from '@/lib/email';

const DELIVERY_METHODS = ['ekont_office', 'ekont_door', 'speedy_office', 'speedy_door'];

export async function createOrder(prevState, formData) {
  const locale = await getLocale();

  const customer_name = formData.get('customer_name')?.toString().trim().slice(0, 200) ?? '';
  const phone = formData.get('phone')?.toString().trim().slice(0, 50) ?? '';
  const email = formData.get('email')?.toString().trim().slice(0, 200) ?? '';
  const delivery_method = formData.get('delivery_method')?.toString().trim() ?? '';
  const address_or_office = formData.get('address_or_office')?.toString().trim().slice(0, 500) ?? '';
  const city = formData.get('city')?.toString().trim().slice(0, 200) ?? '';
  const notes = formData.get('notes')?.toString().trim().slice(0, 1000) ?? '';
  const econt_office_code = formData.get('econt_office_code')?.toString().trim().slice(0, 20) ?? null;
  const cartJson = formData.get('cart')?.toString() ?? '[]';

  if (!customer_name) return { error: 'error_name' };
  if (!phone) return { error: 'error_phone' };
  if (!DELIVERY_METHODS.includes(delivery_method)) return { error: 'error_delivery' };
  if (!address_or_office) return { error: 'error_address' };
  if (!city) return { error: 'error_city' };

  let cartItems;
  try {
    cartItems = JSON.parse(cartJson);
  } catch {
    return { error: 'error_empty_cart' };
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: 'error_empty_cart' };
  }

  const productIds = cartItems.map((i) => i.id);
  const placeholders = productIds.map(() => '?').join(',');
  const dbProducts = db
    .prepare(`SELECT id, price_bgn, stock_qty FROM products WHERE id IN (${placeholders}) AND active = 1`)
    .all(...productIds);

  const dbProductMap = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

  let total_amount = 0;
  const verifiedItems = [];
  for (const item of cartItems) {
    const dbProduct = dbProductMap[item.id];
    if (!dbProduct) return { error: 'error_empty_cart' };
    const unit_price = dbProduct.price_bgn;
    const qty = Math.min(Math.max(1, Math.floor(Number(item.qty))), 999);
    if (dbProduct.stock_qty < qty) return { error: 'error_empty_cart' };
    total_amount += unit_price * qty;
    verifiedItems.push({ product_id: item.id, qty, unit_price });
  }

  const confirmation_token = crypto.randomBytes(32).toString('hex');

  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, phone, email, delivery_method, address_or_office, city, notes, status, total_amount, confirmation_token, econt_office_code)
    VALUES (@customer_name, @phone, @email, @delivery_method, @address_or_office, @city, @notes, 'pending', @total_amount, @confirmation_token, @econt_office_code)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, qty, unit_price)
    VALUES (@order_id, @product_id, @qty, @unit_price)
  `);
  const deductStock = db.prepare(
    'UPDATE products SET stock_qty = MAX(0, stock_qty - ?) WHERE id = ?'
  );

  const createOrderTx = db.transaction(() => {
    const result = insertOrder.run({
      customer_name,
      phone,
      email: email || null,
      delivery_method,
      address_or_office,
      city,
      notes: notes || null,
      total_amount,
      confirmation_token,
      econt_office_code: econt_office_code || null,
    });
    const order_id = result.lastInsertRowid;
    for (const item of verifiedItems) {
      insertItem.run({ order_id, ...item });
      deductStock.run(item.qty, item.product_id);
    }
    return order_id;
  });

  const orderId = createOrderTx();
  sendOrderNotification({
    orderId,
    customerName: customer_name,
    phone,
    email,
    deliveryMethod: delivery_method,
    addressOrOffice: address_or_office,
    city,
    notes,
    totalAmount: total_amount,
  }).catch(() => {});
  redirect(`/${locale}/order-confirmation?token=${confirmation_token}`);
}
