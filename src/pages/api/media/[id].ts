import { $getItem } from '@/server/db/queries/items';
import { $deleteItemMedia, $getItemMediaById, $updateItemMedia } from '@/server/db/queries/media';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFile from '@/server/utils/file/deleteFile';
import $getDir from '@/server/utils/file/getDir';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { THUMBNAILS_OPTIONS } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validatedID } from '@/utils/lib/generateID';
import { ItemData } from '@/utils/types/item';
import { MediaData } from '@/utils/types/media';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/media/[id]
 * Get:  gets a media item by id
 * Patch:  updates a media item by id
 * Delete: deletes a media item
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const mediaDb = await $getItemMediaById(user.id, id as ItemData['id']);
        if (mediaDb.length === 0)
            return res.status(404).json({ message: 'Not Found' })

        const media = mediaDb[0]

        if (req.method === 'GET')
            return res.status(200).json(media);

        if (req.method === 'PATCH') {
            const body = parseJSONReq(await req.body) as Partial<MediaData>
            const data: Partial<MediaData> = {
                title: body.title, // for now only title can be updated
            }

            const updatedMedia = await $updateItemMedia(user.id, media.id, data)
            return res.status(200).json(updatedMedia[0]);
        }

        if (req.method === 'DELETE') {
            const [item] = await $getItem(user.id, media.itemId)
            const { item: itemDir } = await $getDir(user.id, item.listId, item.id)
            $deleteFile(THUMBNAILS_OPTIONS.ITEM_MEDIA, itemDir as string, media.path)
            const deleteMedia = await $deleteItemMedia(user.id, media.id)
            return res.status(200).json(deleteMedia[0]);
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/items/[id]: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }

}