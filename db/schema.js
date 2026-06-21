const schema = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_bg TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('honey', 'mead')),
    variant TEXT,
    price_bgn REAL NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    description_bg TEXT,
    description_en TEXT,
    image_path TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    delivery_method TEXT NOT NULL CHECK(delivery_method IN ('ekont_office', 'ekont_door', 'speedy_office', 'speedy_door')),
    address_or_office TEXT NOT NULL,
    city TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    qty INTEGER NOT NULL,
    unit_price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wholesale_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    estimated_volume TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

module.exports = { schema };
