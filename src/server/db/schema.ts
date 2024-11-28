import { TagData } from "@/utils/types/global";
import { ItemHeader, ItemLayoutTab } from "@/utils/types/item";
import { InferSelectModel, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// forgot to add ON DELETE CASCADE :D
export const usersTable = sqliteTable("users", {
    id: text("id")
        .notNull()
        .primaryKey(),
    username: text("username")
        .notNull()
        .unique(),
    passwordHash: text("password_hash")
        .notNull(),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull(),
    // .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
    // .default(sql`(unixepoch())`),
});

export const sessionsTable = sqliteTable("sessions", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    expiresAt: integer("expires_at", {
        mode: "timestamp"
    }).notNull()
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
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull(),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
    // fav: integer("fav", { mode: "boolean" }).notNull().default(false),
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
    tags: text("tags_ids_json", { mode: "json" })
        .default([])
        .$type<string[]>(),
    layout: text("layout_json", { mode: "json" })
        .default([])
        .$type<ItemLayoutTab[]>(),
    header: text("header_json", { mode: "json" })
        .default({})
        .$type<ItemHeader>(),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull(),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
    // fav: integer("fav", { mode: "boolean" }).notNull().default(false),
    // templates: text("templates").notNull().default("[]"), // JSON string
    // configs: text("templates").notNull().default("[]"), // JSON string
    // apis: text("templates").notNull().default("[]"), // JSON string
});

export const listsTagsTable = sqliteTable("lists_tags", {
    id: text("id")
        .notNull()
        .primaryKey(),
    listId: text("list_id")
        .notNull()
        .references(() => listsTable.id),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    label: text("label")
        .notNull(),
    description: text("description"),
    groupName: text("group_name"),
    badgeable: text("badgeable")
        .default('')
        .$type<TagData['badgeable']>(),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull(),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
});

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;