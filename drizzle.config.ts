import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: "sqlite",
    schema: "./src/server/db/schema.ts",
    out: "./src/server/db/migrations",
    dbCredentials: {
        url: './sqlite.db',
    },
    verbose: true,
    strict: true,
})