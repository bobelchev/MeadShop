### Task 5: Drop orphaned image_path column

**Files:**
- Modify: `db/schema.js` — remove `image_path` column from products table

**Interfaces:**
- Consumes: nothing (column is never written or read by app code)
- Produces: clean schema without orphaned column

Note: SQLite supports `ALTER TABLE DROP COLUMN` since 3.35. The Railway runtime uses a recent SQLite version. The `CREATE TABLE IF NOT EXISTS` in schema.js won't remove the column from existing DBs — only fresh DBs get the clean schema. For existing Railway DB, run `ALTER TABLE products DROP COLUMN image_path;` manually via Railway's shell once. Local dev: delete `data/shop.db` and run `npm run db:init`.

- [ ] **Step 1: Remove `image_path` from `db/schema.js`**

In `db/schema.js`, find the products table definition and remove the `image_path TEXT,` line:

```js
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
    active INTEGER NOT NULL DEFAULT 1
  );
  ...rest unchanged...
`;
```

- [ ] **Step 2: Verify dev server starts without error**

Delete `data/shop.db`, run `npm run db:init && npm run db:seed`, then `npm run dev`. Confirm admin products page loads and images still work (they come from `product_images` table, not this column).

- [ ] **Step 3: Commit**

```bash
git add db/schema.js
git commit -m "chore: drop orphaned image_path column from products schema"
```

---

