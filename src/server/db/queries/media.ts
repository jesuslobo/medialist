import { and, eq, inArray } from "drizzle-orm";
import { db } from "..";
import { itemsMedia } from "../schema";

export const $getItemMedia = async (userId: string, item_id: string) => {
    return await db
        .select()
        .from(itemsMedia)
        .where(and(
            eq(itemsMedia.userId, userId),
            eq(itemsMedia.itemId, item_id)
        ))
}

export const $createItemMedia = async (data: typeof itemsMedia.$inferInsert[] | typeof itemsMedia.$inferInsert) =>
    await db
        .insert(itemsMedia)
        .values(Array.isArray(data) ? data : [data])
        .returning();

export const $updateItemMedia = async (userId: string, id: string, data: Partial<typeof itemsMedia.$inferInsert>) => {
    return await db
        .update(itemsMedia)
        .set(data)
        .where(and(
            eq(itemsMedia.userId, userId),
            eq(itemsMedia.id, id),
        )).limit(1)
        .returning();
}

export const $deleteItemMedia = async (userId: string, ids: string[] | string) => {
    if (!Array.isArray(ids)) ids = [ids];
    return await db
        .delete(itemsMedia)
        .where(and(
            eq(itemsMedia.userId, userId),
            inArray(itemsMedia.id, ids),
        )).limit(ids.length)
        .returning();
}