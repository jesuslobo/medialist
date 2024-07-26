import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: text("id").notNull().primaryKey(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
});

export const sessionsTable = sqliteTable("sessions", {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    expiresAt: integer("expires_at").notNull()
});
