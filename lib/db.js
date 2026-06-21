import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH;
if (!dbPath) throw new Error('DATABASE_PATH env var is not set');

const db = new Database(path.resolve(dbPath));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
