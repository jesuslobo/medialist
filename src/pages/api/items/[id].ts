import { db } from '@/server/db';
import { itemsTable, listsTagsTable } from '@/server/db/schema';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFile from '@/server/utils/file/deleteFile';
import $processItemForm from '@/server/utils/lib/form/processItemForm';
import { coverThumbnailsOptions } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validatedID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ItemData, ItemLayoutTab, ItemSaveResponse, LogoField } from '@/utils/types/item';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/items/[id]
 * Get:  gets an item by id
 * Patch:  updates an item by id
 * Delete: moves an item to the trash
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const item = await db
                .select()
                .from(itemsTable)
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.id, id as ItemData['id'])
                ))

            if (item.length === 0)
                return res.status(404).json({ message: 'Not Found' })

            return res.status(200).json(item[0]);
        }

        if (req.method === 'PATCH') {
            const itemReq = await db.select().from(itemsTable).where(and(
                eq(itemsTable.userId, user.id),
                eq(itemsTable.id, id as ItemData['id']),
            ));

            if (itemReq.length === 0)
                return res.status(404).json({ message: 'Not Found' });

            const item = itemReq[0] // original item

            const tags = await db
                .select({ id: listsTagsTable.id, listId: listsTagsTable.listId })
                .from(listsTagsTable)
                .where(and(
                    eq(listsTagsTable.userId, user.id),
                    eq(listsTagsTable.listId, itemReq[0].listId),
                ))

            const form = await $processItemForm(user.id, item.listId, item.id)
            const { processFiles, processFields, handleTags, mapLayoutsToLogos, dir, data } = form;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 7, files: 30, fileSize: 1024 * 1024 * 50 } // 50MB
            })

            bb.on('field', processFields)
            bb.on('file', processFiles)

            bb.on('finish', async () => {
                form.data.layout = mapLayoutsToLogos()

                let newTagsData: { id: string }[] = []

                // new tags
                if (form.data?.rawTags?.length > 0) {
                    newTagsData = handleTags(tags);
                    if (newTagsData.length > 0)
                        await db.insert(listsTagsTable).values(newTagsData as TagData[])
                }

                if (data.coverPath !== undefined && item.coverPath && item.coverPath !== data.coverPath)
                    $deleteFile(coverThumbnailsOptions.itemCover, dir.item, item.coverPath);

                if (data.posterPath !== undefined && item.posterPath && item.posterPath !== data.posterPath)
                    $deleteFile(coverThumbnailsOptions.itemPoster, dir.item, item.posterPath);

                const oldLogoPaths = extractLogoPaths(item.layout as ItemLayoutTab[])
                const newLogoPaths = new Set(extractLogoPaths(form.data.layout))
                const deletedLogos = oldLogoPaths.filter(logoPath => !newLogoPaths.has(logoPath))
                deletedLogos.forEach(logoPath => logoPath &&
                    $deleteFile(coverThumbnailsOptions.logo, dir.item, logoPath)
                )

                form.data.updatedAt = new Date(Date.now())

                const updatedItem = await db
                    .update(itemsTable)
                    .set(form.data)
                    .where(and(
                        eq(itemsTable.userId, user.id),
                        eq(itemsTable.id, item.id),
                    ))
                    .returning();

                res.status(201).json({
                    item: updatedItem[0],
                    newTags: newTagsData // for cache update on the client
                } as ItemSaveResponse);

                console.log('[Edited] api/items/[id]:', updatedItem[0].id + ' ' + updatedItem[0].title);
            })

            bb.on('error', () =>
                res.status(500).json({ message: 'Internal Server Error' })
            )

            return req.pipe(bb)
        }

        if (req.method === 'DELETE') {
            const item = await db
                .select()
                .from(itemsTable)
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.id, id as ItemData['id'])
                ));

            if (item.length === 0)
                return res.status(404).json({ message: 'Not Found' });

            const updatedItem = await db
                .update(itemsTable)
                .set({
                    trash: true,
                    updatedAt: new Date(Date.now())
                })
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.id, id as ItemData['id'])
                ))
                .returning();

            return res.status(200).json(updatedItem[0]);
        }


        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/items/[id]: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

export const config = {
    api: {
        bodyParser: false,
    },
}

function extractLogoPaths(layout: ItemLayoutTab[]) {
    return layout.flat(Infinity).map(f => (f as LogoField)?.logoPath)
}