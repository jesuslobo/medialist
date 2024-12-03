import { db } from '@/server/db';
import { itemsTable, listsTable } from '@/server/db/schema';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFolder from '@/server/utils/file/deleteFolder';
import $getDir from '@/server/utils/file/getDir';
import { validatedID } from '@/utils/lib/generateID';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/sqlite-core';
import type { NextApiRequest, NextApiResponse } from 'next';

interface RequestData { items: string[], lists: string[] }

/** api/lists/
 * Get: Get all deleted items & lists
 * Delete: delete selected items & lists as provided in RequestData
 * Patch: restore selected items & lists as provided in RequestData
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const items = db.select({
                id: itemsTable.id,
                listId: itemsTable.listId,
                title: itemsTable.title,
                coverPath: itemsTable.posterPath,
                updatedAt: itemsTable.updatedAt,
            }).from(itemsTable).where(and(
                eq(itemsTable.userId, user.id),
                eq(itemsTable.trash, true)
            ))

            const lists = db.select({
                id: listsTable.id,
                listId: sql`NULL`.as('listId'),
                title: listsTable.title,
                coverPath: listsTable.coverPath,
                updatedAt: listsTable.updatedAt,
            }).from(listsTable).where(and(
                eq(listsTable.userId, user.id),
                eq(listsTable.trash, true)
            ))

            const listsAndItems = await unionAll(lists, items).orderBy(desc(itemsTable.updatedAt))

            return res.status(200).json(listsAndItems);
        }

        if (req.method === 'DELETE') {
            const { items, lists }: RequestData = JSON.parse(req.body);
            if (!Array.isArray(items) && !Array.isArray(lists)) return res.status(400).json({ message: 'Bad Request' })

            if (items?.some(id => !validatedID(id)) || lists?.some(id => !validatedID(id)))
                return res.status(400).json({ message: 'Bad Request' })

            // folder structure: /users/:userId/:listId/:itemId, thus we just need to delete the folders
            let TrustedlistsIDs = new Set<string>([])

            if (lists?.length) {
                const deletedLists = await db.delete(listsTable).where(and(
                    eq(listsTable.userId, user.id),
                    eq(listsTable.trash, true),
                    inArray(listsTable.id, lists),
                )).returning({
                    id: listsTable.id,
                    userId: listsTable.userId,
                })

                TrustedlistsIDs = new Set<string>(deletedLists.map(list => list.id))

                deletedLists.forEach(async list => {
                    const dir = await $getDir(user.id, list.id)
                    const listDir = dir.list
                    $deleteFolder(listDir)
                })
            }

            if (items?.length) {
                const deletedItems = await db.delete(itemsTable).where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.trash, true),
                    inArray(itemsTable.id, items),
                )).returning({
                    id: itemsTable.id,
                    listId: itemsTable.listId,
                    userId: itemsTable.userId,
                })

                deletedItems.forEach(async item => {
                    // if the list is already deleted
                    if (TrustedlistsIDs.has(item.listId)) return

                    const dir = await $getDir(user.id, item.listId, item.id)
                    const itemDir = dir.item as string
                    $deleteFolder(itemDir)
                })
            }

            return res.status(200).json({ message: 'Deleted' });
        }

        if (req.method === 'PATCH') {
            const { items, lists }: RequestData = JSON.parse(req.body);
            if (!Array.isArray(items) && !Array.isArray(lists))
                return res.status(400).json({ message: 'Bad Request' })

            if (items?.some(id => !validatedID(id)) || lists?.some(id => !validatedID(id)))
                return res.status(400).json({ message: 'Bad Request' })

            let itemsData;
            let listsData;

            if (lists?.length) {
                listsData = await db.update(listsTable).set({ trash: false }).where(and(
                    eq(listsTable.userId, user.id),
                    eq(listsTable.trash, true),
                    inArray(listsTable.id, lists),
                )).returning()
            }

            if (items?.length) {
                itemsData = await db.update(itemsTable).set({ trash: false }).where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.trash, true),
                    inArray(itemsTable.id, items),
                )).returning()
            }

            return res.status(200).json({ items: itemsData || [], lists: listsData || [] });
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/lists: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

