import { db } from '@/db';
import { itemsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import handleFileUpload from '@/utils/lib/fileHandling/handleFileUpload';
import { coverThumbnailsOptions } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID, validatedID } from '@/utils/lib/generateID';
import { ItemData } from '@/utils/types/item';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import { mkdir } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

/** api/items/[id]
 * Get:  gets an item by id
 * Put:  updates an item by id // Not Implemented Yet
 * Delete: deletes an item by id // Not Implemented Yet
 * Post: creates an item in a list by listId
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

        if (req.method === 'POST') {
            const listId = id as ItemData['listId'];
            const itemId = generateID()

            let data: Partial<ItemData> = {
                id: itemId,
                userId: user.id,
                listId,
                title: undefined,
                description: undefined,
                posterPath: undefined,
                coverPath: undefined,
            }

            const itemDir = join('public', 'users', user.id, listId, itemId);
            const thumbnailsDir = join(itemDir, 'thumbnails')
            await mkdir(thumbnailsDir, { recursive: true });

            const bb = busboy({ headers: req.headers })

            bb.on('file', (name, file, info) => {
                if (name === 'posterPath')
                    data.posterPath = handleFileUpload(file, itemDir, {
                        thumbnails: coverThumbnailsOptions.itemPoster,
                        fileName: info.filename
                    })

                if (name === 'coverPath')
                    data.coverPath = handleFileUpload(file, itemDir, {
                        thumbnails: coverThumbnailsOptions.itemCover,
                        fileName: info.filename
                    })
            })

            bb.on('field', (name, val) => {
                if (name === 'title') data.title = val;
                if (name === 'description') data.description = val;
            })

            bb.on('close', async () => {
                if (!data.title) return res.status(400).json({ message: 'Invalid Request' });

                const item = await db.insert(itemsTable).values({
                    id: itemId,
                    listId,
                    userId: user.id,
                    title: data.title,
                    coverPath: data.coverPath,
                    posterPath: data.posterPath,
                }).returning();

                res.status(201).json(item[0]);
            })
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