### Task 1: Stock deduction on checkout

**Files:**
- Modify: `app/[locale]/checkout/actions.js`

**Interfaces:**
- Consumes: existing `createOrder()` server action and its transaction
- Produces: stock_qty is decremented atomically with order insert

- [ ] **Step 1: Add stock deduction inside the existing transaction**

In `app/[locale]/checkout/actions.js`, add one prepared statement and run it inside `createOrderTx`. The full updated transaction block (lines 66–82):

```js
const insertOrder = db.prepare(`
  INSERT INTO orders (customer_name, phone, email, delivery_method, address_or_office, city, notes, status, total_amount)
  VALUES (@customer_name, @phone, @email, @delivery_method, @address_or_office, @city, @notes, 'pending', @total_amount)
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
  });
  const order_id = result.lastInsertRowid;
  for (const item of verifiedItems) {
    insertItem.run({ order_id, ...item });
    deductStock.run(item.qty, item.product_id);
  }
  return order_id;
});
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Add a product to cart, go to checkout, place an order. Then in the admin at `/admin/products`, confirm that product's stock qty decreased by the quantity ordered.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/checkout/actions.js
git commit -m "feat: deduct stock_qty atomically when order is placed"
```

---

