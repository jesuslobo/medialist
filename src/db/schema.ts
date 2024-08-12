import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: text("id")
        .notNull()
        .primaryKey(),
    username: text("username")
        .notNull()
        .unique(),
    passwordHash: text("password_hash")
        .notNull(),
    // createdAt: integer("created_at").notNull(),
    // updatedAt: integer("updated_at").notNull(),
});

export const sessionsTable = sqliteTable("sessions", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    expiresAt: integer("expires_at")
        .notNull()
});

export const listsTable = sqliteTable("lists", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    title: text("title")
        .notNull(),
    coverPath: text("cover_path"),
    trash: integer("trash", { mode: "boolean" })
        .notNull()
        .default(false),
    // fav: integer("fav", { mode: "boolean" }).notNull().default(false),
    // createdAt: integer("created_at").notNull(),
    // updatedAt: integer("updated_at").notNull(),
    // templates: text("templates").notNull().default("[]"), // JSON string
    // configs: text("templates").notNull().default("[]"), // JSON string
    // apis: text("templates").notNull().default("[]"), // JSON string
});

export const itemsTable = sqliteTable("items", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    listId: text("list_id")
        .notNull()
        .references(() => listsTable.id),
    title: text("title")
        .notNull(),
    posterPath: text("poster_path"),
    coverPath: text("cover_path"),
    description: text("description"),
    trash: integer("trash", { mode: "boolean" })
        .notNull()
        .default(false),
    // fav: integer("fav", { mode: "boolean" }).notNull().default(false),
    // createdAt: integer("created_at").notNull(),
    // updatedAt: integer("updated_at").notNull(),
    // templates: text("templates").notNull().default("[]"), // JSON string
    // configs: text("templates").notNull().default("[]"), // JSON string
    // apis: text("templates").notNull().default("[]"), // JSON string
});