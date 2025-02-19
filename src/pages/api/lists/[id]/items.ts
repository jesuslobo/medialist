import { $createItems, $getItems } from '@/server/db/queries/items';
import { $getList } from '@/server/db/queries/lists';
import { $createItemMedia } from '@/server/db/queries/media';
import { $createTags, $getTags } from '@/server/db/queries/tags';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $processItemForm from '@/server/utils/lib/form/processItemForm';
import { $generateShortID } from '@/server/utils/lib/generateID';
import { validateShortID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ItemSaveResponse } from '@/utils/types/item';
import { ListData } from '@/utils/types/list';
import { MediaData } from '@/utils/types/media';
import { ApiErrorCode } from '@/utils/types/serverResponse';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

const MAX_UPLOAD_LIMIT = 1024 * 1024 * 50; // 100MB
const MAX_ALLOWED_FILES = 40;
const MAX_FIELD_SIZE = 1024 * 1024 * 5; // 5MB

/** api/lists/[id]/items
 * Get: Get all items of a list
 * Post: creates an item in the list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ errorCode: ApiErrorCode.UNAUTHORIZED })

        const { id: listId } = req.query as { id: ListData['id'] };
        if (!validateShortID(listId)) return res.status(400).json({ errorCode: ApiErrorCode.BAD_REQUEST });

        const listsDb = await $getList(user.id, listId);
        if (listsDb.length === 0) return res.status(404).json({ errorCode: ApiErrorCode.NOT_FOUND });
        const list = listsDb[0];

        if (req.method === 'GET') {
            const items = await $getItems(user.id, list.id)
            return res.status(200).json(items);
        }

        if (req.method === 'POST') {
            const itemId = $generateShortID()
            const tags = await $getTags(user.id, list.id)

            const form = await $processItemForm(user.id, list.id, itemId)
            const { processFiles, processFields, handleTags, mapLayoutsToPaths, handleMediaImages, promises } = form;

            form.data['id'] = itemId;
            form.data['userId'] = user.id;
            form.data['listId'] = list.id;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 7, fieldSize: MAX_FIELD_SIZE, files: MAX_ALLOWED_FILES, fileSize: MAX_UPLOAD_LIMIT }
            })

            bb.on('field', processFields)
            bb.on('file', processFiles)

            bb.on('finish', async () => {
                if (!form.data.title)
                    return res.status(400).json({
                        message: 'Title is required',
                        errorCode: ApiErrorCode.BAD_REQUEST
                    });

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

                const [item] = await $createItems(form.data)

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
                res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR })
            )

            return req.pipe(bb)
        }

        res.status(405).json({ errorCode: ApiErrorCode.METHOD_NOT_ALLOWED })
    } catch (error) {
        console.log("[Error] api/lists/[id]/items: ", error)
        res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};