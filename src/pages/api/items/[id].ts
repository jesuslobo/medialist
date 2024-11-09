import { db } from '@/db';
import { itemsTable, listsTagsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { coverThumbnailsOptions, thumbnailName } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validatedID } from '@/utils/lib/generateID';
import $deleteFile from '@/utils/server/fileHandling/deleteFile';
import $handleItemForm, { HandleItemFormData } from '@/utils/server/handleItemForm';
import { TagData } from '@/utils/types/global';
import { ItemData, ItemSaveResponse, LogoField } from '@/utils/types/item';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

/** api/items/[id]
 * Get:  gets an item by id
 * Patch:  updates an item by id
 * Delete: deletes an item by id // Not Implemented Yet
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const item = await db
                .select()
                .from(itemsTable)
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.id, id as ItemData['id'])
                ))
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

            const form = await $handleItemForm<ItemForm>(user.id, item.listId, item.id)
            const { handleFields, handleFiles, handleTags, mapLayoutsToLogos, dir } = form;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 7, files: 30, fileSize: 1024 * 1024 * 50 } // 50MB
            })


            bb.on('field', (name, value) => {
                handleFields(name, value)
                switch (name) { // for deleted covers
                    case 'poster': form.data.posterIsDeleted = !Boolean(JSON.parse(value)); break
                    case 'cover': form.data.coverIsDeleted = !Boolean(JSON.parse(value)); break
                }
            })
            bb.on('file', handleFiles)
            bb.on('finish', async () => {
                form.data.layout = mapLayoutsToLogos()

                let newTagsData: { id: string }[] = []

                // new tags
                if (form.data?.rawTags?.length > 0) {
                    newTagsData = handleTags(tags);
                    if (newTagsData.length > 0)
                        await db.insert(listsTagsTable).values(newTagsData as TagData[])
                }

                if (form.data.posterIsDeleted && !form.data.posterPath)
                    form.data.posterPath = null as any // drizzle does not accept undefined

                if (form.data.coverIsDeleted && !form.data.coverPath)
                    form.data.coverPath = null as any // drizzle does not accept undefined

                const deletedMedia = deletedMediaPaths(form.data, item as ItemData, dir.item)

                // the user does not have to wait for the media to be deleted
                Promise.all(deletedMedia.map(path => $deleteFile(path)))

                delete form.data.posterIsDeleted
                delete form.data.coverIsDeleted

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
};

function deletedMediaPaths(formData: ItemForm, oldData: ItemData, itemDir: string) {
    let deletedMedia = []

    // if cover and poster changed delete the old ones if they exist
    if ((formData.coverPath || formData.coverIsDeleted) && typeof oldData.coverPath === 'string') {
        deletedMedia.push(join(itemDir, oldData.coverPath))
        coverThumbnailsOptions.itemCover.forEach(thumbnailOption => {
            const thumbnailPath = join(itemDir, thumbnailName(oldData.coverPath as string, thumbnailOption))
            deletedMedia.push(thumbnailPath)
        })
    }

    if ((formData.posterPath || formData.posterIsDeleted) && typeof oldData.posterPath === 'string') {
        deletedMedia.push(join(itemDir, oldData.posterPath))
        coverThumbnailsOptions.itemPoster.forEach(thumbnailOption => {
            const thumbnailPath = join(itemDir, thumbnailName(oldData.posterPath as string, thumbnailOption))
            deletedMedia.push(thumbnailPath)
        })
    }

    const originalLogoPaths = oldData.layout?.flat(2).map(f => (f as LogoField)?.logoPath)
    const newLogoPaths = new Set(formData.layout.flat(2).map(f => (f as LogoField)?.logoPath))

    //if a logo exists in the orignal item layout but not in the new one => delete it
    originalLogoPaths?.forEach(logoPath => {
        if (!newLogoPaths.has(logoPath) && logoPath) {
            deletedMedia.push(join(itemDir, logoPath))
            coverThumbnailsOptions.logo.forEach(thumbnailOption => {
                const thumbnailPath = join(itemDir, thumbnailName(logoPath as string, thumbnailOption))
                deletedMedia.push(thumbnailPath)
            })
        }
    })

    return deletedMedia
}

interface ItemForm extends HandleItemFormData {
    coverIsDeleted?: boolean
    posterIsDeleted?: boolean
}