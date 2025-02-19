import { $getItem, $updateItems } from '@/server/db/queries/items';
import { $createItemMedia } from '@/server/db/queries/media';
import { $createTags, $getTags } from '@/server/db/queries/tags';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFile from '@/server/utils/file/deleteFile';
import $processItemForm from '@/server/utils/lib/form/processItemForm';
import { THUMBNAILS_OPTIONS } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validateShortID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ItemData, ItemLayoutTab, ItemSaveResponse, LogoField } from '@/utils/types/item';
import { MediaData } from '@/utils/types/media';
import { ApiErrorCode } from '@/utils/types/serverResponse';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

const MAX_UPLOAD_LIMIT = 1024 * 1024 * 100; // 100MB
const MAX_ALLOWED_FILES = 40;
const MAX_FIELD_SIZE = 1024 * 1024 * 5; // 5MB

/** api/items/[id]
 * Get:  gets an item by id
 * Patch:  updates an item by id
 * Delete: moves an item to the trash
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ errorCode: ApiErrorCode.UNAUTHORIZED });

        const { id } = req.query;
        if (!validateShortID(id)) return res.status(400).json({ errorCode: ApiErrorCode.BAD_REQUEST });

        const items = await $getItem(user.id, id as ItemData['id']);
        if (items.length === 0)
            return res.status(404).json({ errorCode: ApiErrorCode.NOT_FOUND });
        const item = items[0]

        if (req.method === 'GET')
            return res.status(200).json(item);

        if (req.method === 'PATCH') {
            const tags = await $getTags(user.id, item.listId)

            const form = await $processItemForm(user.id, item.listId, item.id)
            const { processFiles, processFields, handleTags, mapLayoutsToPaths, handleMediaImages, dir, data, promises } = form;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 9, fieldSize: MAX_FIELD_SIZE, files: MAX_ALLOWED_FILES, fileSize: MAX_UPLOAD_LIMIT, }
            })

            bb.on('field', processFields)
            bb.on('file', processFiles)

            bb.on('finish', async () => {
                let newTagsData: { id: string }[] = []

                // new tags
                if (form.data?.tags && form.data.tags.length > 0) {
                    newTagsData = handleTags(tags);
                    if (newTagsData.length > 0)
                        await $createTags(newTagsData as TagData[]);
                }

                if (data.coverPath !== undefined && item.coverPath && item.coverPath !== data.coverPath)
                    $deleteFile(THUMBNAILS_OPTIONS.ITEM_COVER, dir.item, item.coverPath);

                if (data.posterPath !== undefined && item.posterPath && item.posterPath !== data.posterPath)
                    $deleteFile(THUMBNAILS_OPTIONS.ITEM_POSTER, dir.item, item.posterPath);

                // in like in createItem, we can create items directly here, since item's id exists, and won't cause a foreign key error
                let newMediaData: MediaData[] = []
                if (form.data?.media && Array.isArray(form.data.media) && form.data.media.length > 0) {
                    const toAdd = handleMediaImages()
                    form.data.media = toAdd
                    newMediaData = await $createItemMedia(toAdd)
                }

                if (form.data.layout !== undefined) {
                    form.data.layout = mapLayoutsToPaths()

                    const oldLogoPaths = extractLogoPaths(item.layout as ItemLayoutTab[])
                    const newLogoPaths = new Set(extractLogoPaths(form.data.layout))
                    const deletedLogos = oldLogoPaths.filter(logoPath => !newLogoPaths.has(logoPath))
                    deletedLogos.forEach(logoPath => logoPath &&
                        $deleteFile(THUMBNAILS_OPTIONS.LOGO, dir.item, logoPath)
                    )
                }

                form.data.updatedAt = new Date(Date.now())
                const [updateItem] = await $updateItems(user.id, item.id, form.data)

                await Promise.all(promises)
                res.status(200).json({
                    item: updateItem,
                    // for cache update on the client:
                    newTags: newTagsData,
                    newMedia: newMediaData,
                } as ItemSaveResponse);

                console.log('[Edited] api/items/[id]:', updateItem.id + ' ' + updateItem.title);
            })

            bb.on('error', () =>
                res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR })
            )

            return req.pipe(bb)
        }

        // move to trash
        if (req.method === 'DELETE') {
            const data = {
                trash: true,
                updatedAt: new Date(Date.now())
            }

            const updatedItem = await $updateItems(user.id, item.id, data)
            return res.status(200).json(updatedItem[0]);
        }

        res.status(405).json({ errorCode: ApiErrorCode.METHOD_NOT_ALLOWED });
    } catch (error) {
        console.log("[Error] api/items/[id]: ", error)
        res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR });
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