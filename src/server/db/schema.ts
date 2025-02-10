import { TagData } from "@/utils/types/global";
import { ItemHeader, ItemLayoutTab } from "@/utils/types/item";
import { MediaData } from "@/utils/types/media";
import { InferSelectModel, sql } from "drizzle-orm";
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
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
});

export const sessionsTable = sqliteTable("sessions", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    agent: text("agent_json", { mode: "json" })
        .notNull()
        .default("{}"),
    expiresAt: integer("expires_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
});

export const listsTable = sqliteTable("lists", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    title: text("title")
        .notNull(),
    coverPath: text("cover_path"),
    configs: text("configs_json", { mode: "json" })
        .notNull()
        .default("{}"),
    trash: integer("trash", { mode: "boolean" })
        .notNull()
        .default(false),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    // fav: integer("fav", { mode: "boolean" }).notNull().default(false),
    // templates: text("templates").notNull().default("[]"), // JSON string
    // apis: text("templates").notNull().default("[]"), // JSON string
});

export const itemsTable = sqliteTable("items", {
    id: text("id")
        .notNull()
        .primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    listId: text("list_id")
        .notNull()
        .references(() => listsTable.id, { onDelete: "cascade" }),
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
    }).notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    fav: integer("fav", { mode: "boolean" })
        .notNull()
        .default(false),
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
        .references(() => listsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    label: text("label")
        .notNull(),
    description: text("description"),
    groupName: text("group_name"),
    badgeable: text("badgeable")
        .default('')
        .$type<TagData['badgeable']>(),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
});

export const itemsMedia = sqliteTable("items_media", {
    id: text("id")
        .notNull()
        .primaryKey(),
    itemId: text("item_id")
        .notNull()
        .references(() => itemsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    title: text("title"),
    keywords: text("json_keywords", { mode: "json" })
        .notNull()
        .default("[]")
        .$type<string[]>(),
    path: text("path")
        .notNull(),
    type: text("type")
        .notNull()
        .default("image")
        .$type<MediaData['type']>(),
    createdAt: integer("created_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", {
        mode: "timestamp"
    }).notNull()
        .default(sql`(unixepoch())`),
});

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;