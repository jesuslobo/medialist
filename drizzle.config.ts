import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: "sqlite",
    schema: "./src/server/db/schema.ts",
    out: "./src/server/db/migrations",
    dbCredentials: {
        url: process.env.DATABASE_PATH || 'db/sqlite.db',
    },
    verbose: true,
    strict: true,
})