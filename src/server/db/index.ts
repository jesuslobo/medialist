import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const db = process.env.VITEST
    ? drizzle(new Database(process.env.TEST_DATABASE_PATH || 'tests.db'))
    : drizzle(new Database(process.env.DATABASE_PATH || 'data.db'))