'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import db from '@/lib/db';

const DELIVERY_METHODS = ['ekont_office', 'ekont_door', 'speedy_office', 'speedy_door'];

export async function createOrder(prevState, formData) {
  const locale = await getLocale();

  const customer_name = formData.get('customer_name')?.toString().trim() ?? '';
  const phone = formData.get('phone')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim() ?? '';
  const delivery_method = formData.get('delivery_method')?.toString().trim() ?? '';
  const address_or_office = formData.get('address_or_office')?.toString().trim() ?? '';
  const city = formData.get('city')?.toString().trim() ?? '';
  const notes = formData.get('notes')?.toString().trim() ?? '';
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

  // Re-fetch prices from DB — never trust client-submitted prices
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
    const qty = Math.max(1, Math.floor(Number(item.qty)));
    total_amount += unit_price * qty;
    verifiedItems.push({ product_id: item.id, qty, unit_price });
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, phone, email, delivery_method, address_or_office, city, notes, status, total_amount)
    VALUES (@customer_name, @phone, @email, @delivery_method, @address_or_office, @city, @notes, 'pending', @total_amount)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, qty, unit_price)
    VALUES (@order_id, @product_id, @qty, @unit_price)
  `);

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
    });
    const order_id = result.lastInsertRowid;
    for (const item of verifiedItems) {
      insertItem.run({ order_id, ...item });
    }
    return order_id;
  });

  const orderId = createOrderTx();
  redirect(`/${locale}/order-confirmation?id=${orderId}`);
}
