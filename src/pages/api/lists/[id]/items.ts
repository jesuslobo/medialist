import { db } from '@/server/db';
import { $getItems } from '@/server/db/queries/items';
import { $getList } from '@/server/db/queries/lists';
import { $createTags, $getTags } from '@/server/db/queries/tags';
import { itemsTable } from '@/server/db/schema';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $processItemForm from '@/server/utils/lib/form/processItemForm';
import { generateID, validatedID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ItemSaveResponse } from '@/utils/types/item';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

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

        if (req.method === 'GET') {
            const items = await $getItems(user.id, listId)
            return res.status(200).json(items);
        }

        if (req.method === 'POST') {
            const itemId = generateID()

            const [lists, tags] = await Promise.all([
                await $getList(user.id, listId),
                await $getTags(user.id, listId)
            ])

            if (lists.length === 0 || tags.length !== 0 && tags[0].listId !== listId)
                return res.status(400).json({ message: 'Bad Request' });

            const list = lists[0];

            const form = await $processItemForm(user.id, list.id, itemId)
            const { processFiles, processFields, handleTags, mapLayoutsToLogos } = form;

            form.data['id'] = itemId;
            form.data['userId'] = user.id;
            form.data['listId'] = list.id;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 5, files: 30, fileSize: 1024 * 1024 * 50 } // 50MB
            })

            bb.on('field', processFields)
            bb.on('file', processFiles)

            bb.on('finish', async () => {
                if (!form.data.title)
                    res.status(400).json({ message: 'Bad Request' });

                form.data.layout = mapLayoutsToLogos()

                let newTagsData: { id: string }[] = []
                // new tags
                if (form.data?.tags && form.data.tags.length > 0) {
                    newTagsData = handleTags(tags);
                    if (newTagsData.length > 0)
                        await $createTags(newTagsData as TagData[]);
                }

                form.data.createdAt = new Date(Date.now())
                form.data.updatedAt = new Date(Date.now())

                const item = await db
                    .insert(itemsTable)
                    .values(form.data)
                    .returning();

                res.status(201).json({
                    item: item[0],
                    newTags: newTagsData // for cache update on the client
                } as ItemSaveResponse);

                console.log('[Created] api/lists/[id]/items:', item[0].id + ' ' + item[0].title);
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