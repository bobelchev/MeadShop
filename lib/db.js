import Database from 'better-sqlite3';
import path from 'path';

let db;

function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH;
    if (!dbPath) throw new Error('DATABASE_PATH env var is not set');

    db = new Database(path.resolve(dbPath));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
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
