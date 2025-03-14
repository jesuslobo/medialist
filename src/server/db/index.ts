import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const db = drizzle(new Database(process.env.DATABASE_PATH || 'db/sqlite.db'))