# Task 4 Report: Database Layer

## Status: DONE

## Commit Hash
`860ccb0`

## Files Created

- `db/schema.js` — CommonJS module exporting the SQL schema string for all 4 tables
- `db/init.js` — CommonJS script: reads `DATABASE_PATH` (falls back to `./data/shop.db`), creates the `data/` directory if needed, opens the DB, sets WAL + foreign keys, runs schema, closes
- `db/seed.js` — CommonJS script: inserts 3 products (Linden Honey 700г @ 18.00 BGN, Linden Honey 240г @ 8.00 BGN, Traditional Mead 750мл @ 32.00 BGN) in a transaction
- `lib/db.js` — ES module singleton: throws if `DATABASE_PATH` is missing, opens DB with WAL + foreign keys, exports default

## package.json Changes

Added two scripts to the `"scripts"` object:
```json
"db:init": "node db/init.js",
"db:seed": "node db/seed.js"
```

## Verification Output

### npm run db:init
```
> mead-shop@0.1.0 db:init
> node db/init.js

Database initialized at C:\Users\bobel\Desktop\ClaudeTestProject\MeadShop\data\shop.db
```

### npm run db:seed
```
> mead-shop@0.1.0 db:seed
> node db/seed.js

Seeded 3 products.
```

### Table verification
```
node -e "const db = require('better-sqlite3')('./data/shop.db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=?').all('table').map(r=>r.name));"
```
Output:
```
[
  'products',
  'sqlite_sequence',
  'orders',
  'order_items',
  'wholesale_inquiries'
]
```

All 4 schema tables present. `sqlite_sequence` is an internal SQLite table added automatically for AUTOINCREMENT columns — not a concern.

## Concerns

None.
