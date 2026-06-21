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
