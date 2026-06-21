### Task 4: Database layer

**Files:**
- Create: `db/schema.js`, `db/init.js`, `db/seed.js`, `lib/db.js`

Note on module formats: `db/*.js` scripts run directly with Node (outside Next.js bundler) so they use CommonJS (`require`). `lib/db.js` is imported by Next.js app code, so it uses ES module `import/export`.

- [ ] **Step 1: Create db/schema.js**

```javascript
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
```

- [ ] **Step 2: Create db/init.js**

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { schema } = require('./schema');

const dbPath = process.env.DATABASE_PATH || './data/shop.db';
const resolved = path.resolve(dbPath);
const dir = path.dirname(resolved);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(resolved);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(schema);
db.close();

console.log('Database initialized at', resolved);
```

- [ ] **Step 3: Create db/seed.js**

```javascript
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './data/shop.db';
const db = new Database(path.resolve(dbPath));

const insert = db.prepare(`
  INSERT INTO products (name_bg, name_en, category, variant, price_bgn, stock_qty,
                        description_bg, description_en, active)
  VALUES (@name_bg, @name_en, @category, @variant, @price_bgn, @stock_qty,
          @description_bg, @description_en, @active)
`);

const seed = db.transaction(() => {
  insert.run({
    name_bg: 'Липов мед', name_en: 'Linden Honey',
    category: 'honey', variant: '700г',
    price_bgn: 18.00, stock_qty: 50,
    description_bg: 'Чист липов мед от горски пчелини.',
    description_en: 'Pure linden honey from forest apiaries.',
    active: 1,
  });
  insert.run({
    name_bg: 'Липов мед', name_en: 'Linden Honey',
    category: 'honey', variant: '240г',
    price_bgn: 8.00, stock_qty: 80,
    description_bg: 'Чист липов мед от горски пчелини.',
    description_en: 'Pure linden honey from forest apiaries.',
    active: 1,
  });
  insert.run({
    name_bg: 'Традиционна медовина', name_en: 'Traditional Mead',
    category: 'mead', variant: '750мл',
    price_bgn: 32.00, stock_qty: 30,
    description_bg: 'Ферментирала медовина по традиционна рецепта.',
    description_en: 'Fermented mead made with a traditional recipe.',
    active: 1,
  });
});

seed();
db.close();
console.log('Seeded 3 products.');
```

- [ ] **Step 4: Create lib/db.js**

```javascript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH;
if (!dbPath) throw new Error('DATABASE_PATH env var is not set');

const db = new Database(path.resolve(dbPath));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
```

- [ ] **Step 5: Add db scripts to package.json**

In `package.json`, add to the `"scripts"` object:

```json
"db:init": "node db/init.js",
"db:seed": "node db/seed.js"
```

- [ ] **Step 6: Run init and seed**

```bash
npm run db:init
npm run db:seed
```

Expected output:
```
Database initialized at C:\...\MeadShop\data\shop.db
Seeded 3 products.
```

- [ ] **Step 7: Verify tables**

```bash
node -e "const db = require('better-sqlite3')('./data/shop.db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=?').all('table').map(r=>r.name));"
```

Expected: `[ 'products', 'orders', 'order_items', 'wholesale_inquiries' ]`

- [ ] **Step 8: Commit**

```bash
git add db/ lib/ package.json package-lock.json
git commit -m "feat: add SQLite schema, init/seed scripts, and db singleton"
```

---

