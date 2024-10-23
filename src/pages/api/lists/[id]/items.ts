import { db } from '@/db';
import { itemsTable, listsTagsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import handleFileUpload from '@/utils/lib/fileHandling/handleFileUpload';
import { coverThumbnailsOptions } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID, validatedID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ItemData, ItemField, ItemLayoutTab, ItemSaveResponse, LogoField } from '@/utils/types/item';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import { mkdir } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

/** api/lists/[id]/items
 * Get: Get all items of a list
 * Post: creates an item in the list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id: listId } = req.query as { id: ListData['id'] };
        if (!validatedID(listId)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const items = await db
                .select()
                .from(itemsTable)
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.listId, listId),
                    eq(itemsTable.trash, false)
                ));

            return res.status(200).json(items);
        }

        if (req.method === 'POST') {
            const itemId = generateID()

            let data = {
                id: itemId,
                userId: user.id,
                listId,
                tags: [] as string[],
            } as ItemData & { rawTags: string[] };

            const itemDir = join('public', 'users', user.id, listId, itemId);
            const thumbnailsDir = join(itemDir, 'thumbnails')
            await mkdir(thumbnailsDir, { recursive: true });

            const bb = busboy({
                headers: req.headers,
                limits: { fields: 5, files: 30, fileSize: 1024 * 1024 * 50 } // 50MB
            })

            let logoPaths = new Map<String, LogoField['logoPath']>()

            bb.on('field', (name, val) => {
                if (name === 'title') data.title = val;
                if (name === 'description') data.description = val;
                if (name === 'header') data.header = JSON.parse(val);
                if (name === 'tags') data.rawTags = JSON.parse(val);
                if (name === 'layout') {
                    const layout = JSON.parse(val) as ItemLayoutTab[];
                    data.layout = layout
                }
            })

            bb.on('file', (name, file, info) => {
                if (name.includes('logoFields')) {
                    const id = name
                    const logoPath = handleFileUpload(file, itemDir, {
                        thumbnails: coverThumbnailsOptions.logo,
                        fileName: info.filename
                    })
                    logoPaths.set(id, logoPath)
                }

                if (name === 'poster')
                    data.posterPath = handleFileUpload(file, itemDir, {
                        thumbnails: coverThumbnailsOptions.itemPoster,
                        fileName: info.filename
                    })

                if (name === 'cover')
                    data.coverPath = handleFileUpload(file, itemDir, {
                        thumbnails: coverThumbnailsOptions.itemCover,
                        fileName: info.filename
                    })
                file.resume()
            })

            bb.on('finish', async () => {
                if (!data.title) res.status(400).json({ message: 'Invalid Request' });

                data.layout = data.layout?.map(tab =>
                    tab.map((row, rowIndex) =>
                        rowIndex === 0
                            ? row // header
                            : (row as ItemField[]).map(field => {
                                if ((field as LogoField)?.logoPath) {
                                    const fieldT = field as LogoField;
                                    const id = `logoFields[${fieldT.logoPath}]`
                                    return { ...field, logoPath: logoPaths.get(id), id: undefined }
                                } else {
                                    return { ...field, id: undefined }
                                }
                            })
                    )
                ) as ItemLayoutTab[] || []

                const tags = await db
                    .select({ id: listsTagsTable.id })
                    .from(listsTagsTable)
                    .where(and(
                        eq(listsTagsTable.userId, user.id),
                        eq(listsTagsTable.listId, data.listId as ListData['id']),
                    ))

                let newTags = [] as string[]

                data.rawTags.forEach(tag => {
                    // tag could be a new tag name or an existing tag id
                    // if A user can type a tag of 10 letters that can escape validation
                    if (tag.length !== 10) {
                        newTags.push(tag) // no need to check if it exists
                    } else if (tags.some(t => t.id === tag)) {
                        data.tags.push(tag)
                    } else {
                        newTags.push(tag)
                    }
                })

                let newTagsData = [] as TagData[]
                if (newTags.length) {
                    newTagsData = newTags.map(tag => {
                        let tagData = {
                            id: generateID(),
                            userId: user.id,
                            listId: data.listId as ListData['id'],
                            label: tag,
                        }
                        data.tags.push(tagData.id)
                        return tagData
                    })

                    await db.insert(listsTagsTable).values(newTagsData)
                }

                const item = await db
                    .insert(itemsTable)
                    .values(data)
                    .returning();

                res.status(201).json({
                    item: item[0],
                    newTags: newTagsData // for cache update on the client
                } as ItemSaveResponse);
                console.log('[Created] api/lists/[id]/items:', item[0].id + ' ' + item[0].title);
                res.status(201).json({ data });
            }).on('error', () =>
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