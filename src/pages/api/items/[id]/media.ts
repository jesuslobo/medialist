import { $getItem } from '@/server/db/queries/items';
import { $createItemMedia, $getItemMedia } from '@/server/db/queries/media';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $getDir from '@/server/utils/file/getDir';
import { $ITEM_MEDIA_FORM_SCHEMA } from '@/server/utils/lib/form/fromSchema';
import $processFormData, { ProcessedFormData } from '@/server/utils/lib/processFormData';
import { generateID, validatedID } from '@/utils/lib/generateID';
import { ItemData } from '@/utils/types/item';
import { MediaData } from '@/utils/types/media';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

const MAX_FILE_SIZE = 1024 * 1024 * 20 // 50MB

/** api/items/[id]/media
 * Get: gets all media of an item
 * Post: add media to an item
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const items = await $getItem(user.id, id as ItemData['id']);

        if (items.length === 0)
            return res.status(404).json({ message: 'Not Found' })

        const item = items[0]

        if (req.method === 'GET') {
            const media = await $getItemMedia(user.id, item.id)
            return res.status(200).json(media);
        }

        if (req.method === 'POST') {
            const { item: itemDir } = await $getDir(user.id, item.listId, item.id);
            const form = $processFormData<MediaData & ProcessedFormData>($ITEM_MEDIA_FORM_SCHEMA(itemDir as string));
            const { processFiles, processFields, data } = form;

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 2, files: 1, fileSize: MAX_FILE_SIZE }
            })

            bb.on('field', processFields)
            bb.on('file', processFiles)

            bb.on('finish', async () => {
                const id = generateID();

                if (!data.path)
                    return res.status(400).json({ message: 'Bad Request' });

                const mediaDb = await $createItemMedia({
                    id,
                    userId: user.id,
                    itemId: item.id,
                    title: data.title,
                    type: 'image',
                    path: data.path,
                    updatedAt: new Date(Date.now()),
                    createdAt: new Date(Date.now())
                })

                const media = mediaDb[0]
                res.status(200).json(media);
                console.log('[Create] api/items/[id]/media:', media.id + ' ' + media.title);
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
}