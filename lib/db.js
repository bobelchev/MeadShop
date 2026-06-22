import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { schema } = require('../db/schema.js');

let db;

function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH;
    if (!dbPath) throw new Error('DATABASE_PATH env var is not set');

    const resolved = path.resolve(dbPath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(resolved);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(schema);

    // Migration: add confirmation_token to orders if not present (safe to run on every open)
    const hasToken = db
      .prepare("SELECT 1 FROM pragma_table_info('orders') WHERE name='confirmation_token'")
      .get();
    if (!hasToken) {
      db.exec('ALTER TABLE orders ADD COLUMN confirmation_token TEXT');
    }

    const hasWeight = db
      .prepare("SELECT 1 FROM pragma_table_info('products') WHERE name='weight_kg'")
      .get();
    if (!hasWeight) {
      db.exec('ALTER TABLE products ADD COLUMN weight_kg REAL NOT NULL DEFAULT 0.5');
    }

    for (const col of ['econt_office_code', 'econt_shipment_number', 'econt_waybill_url']) {
      const exists = db
        .prepare(`SELECT 1 FROM pragma_table_info('orders') WHERE name='${col}'`)
        .get();
      if (!exists) db.exec(`ALTER TABLE orders ADD COLUMN ${col} TEXT`);
    }

    const hasDeliveryPrice = db
      .prepare("SELECT 1 FROM pragma_table_info('orders') WHERE name='delivery_price_eur'")
      .get();
    if (!hasDeliveryPrice) {
      db.exec('ALTER TABLE orders ADD COLUMN delivery_price_eur REAL');
    }
  }
  return db;
}

export default new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getDb();
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);
