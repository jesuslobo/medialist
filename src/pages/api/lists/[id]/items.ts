import { db } from '@/server/db';
import { $getItems } from '@/server/db/queries/items';
import { $getList } from '@/server/db/queries/lists';
import { $createItemMedia } from '@/server/db/queries/media';
import { $createTags, $getTags } from '@/server/db/queries/tags';
import { itemsTable } from '@/server/db/schema';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $processItemForm from '@/server/utils/lib/form/processItemForm';
import { generateID, validatedID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ItemSaveResponse } from '@/utils/types/item';
import { ListData } from '@/utils/types/list';
import { MediaData } from '@/utils/types/media';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

const MAX_UPLOAD_LIMIT = 1024 * 1024 * 50; // 50MB
const MAX_ALLOWED_FILES = 40;

/** api/lists/[id]/items
 * Get: Get all items of a list
 * Post: creates an item in the list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id: listId } = req.query as { id: ListData['id'] };
        if (!validatedID(listId)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const listsDb = await $getList(user.id, listId);
        if (listsDb.length === 0) return res.status(404).json({ message: 'Not Found' });

        const list = listsDb[0];

        if (req.method === 'GET') {
            const items = await $getItems(user.id, list.id)
            return res.status(200).json(items);
        }

        if (req.method === 'POST') {
            const itemId = generateID()
            const tags = await $getTags(user.id, list.id)

            const form = await $processItemForm(user.id, list.id, itemId)
            const { processFiles, processFields, handleTags, mapLayoutsToPaths, handleMediaImages, promises } = form;

            form.data['id'] = itemId;
            form.data['userId'] = user.id;
            form.data['listId'] = list.id;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 7, files: MAX_ALLOWED_FILES, fileSize: MAX_UPLOAD_LIMIT }
            })

            bb.on('field', processFields)
            bb.on('file', processFiles)

            bb.on('finish', async () => {
                if (!form.data.title)
                    return res.status(400).json({ message: 'Bad Request' });

                let newTagsData: { id: string }[] = []
                // new tags
                if (form.data?.tags && form.data.tags.length > 0) {
                    newTagsData = handleTags(tags);
                    if (newTagsData.length > 0)
                        await $createTags(newTagsData as TagData[]);
                }

                form.data.createdAt = new Date(Date.now())
                form.data.updatedAt = new Date(Date.now())

                let newMediaData: MediaData[] = []
                if (form.data.media) {
                    // we init it here, since we mediaIDs for some fields
                    newMediaData = handleMediaImages()
                    form.data.media = newMediaData
                }

                form.data.layout = mapLayoutsToPaths()

                const [item] = await db
                    .insert(itemsTable)
                    .values(form.data)
                    .returning();

                // should be created after the item, since it uses the item id as a foreign key
                if (form.data.media)
                    newMediaData = await $createItemMedia(newMediaData)

                await Promise.all(promises)
                res.status(201).json({
                    item: item,
                    // for cache update on the client:
                    newTags: newTagsData,
                    newMedia: newMediaData,
                } as ItemSaveResponse);

                console.log('[Created] api/lists/[id]/items:', item.id + ' ' + item.title);
            })

            bb.on('error', () =>
                res.status(500).json({ message: 'Internal Server Error' })
            )

            return req.pipe(bb)
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/lists/[id]/items: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};