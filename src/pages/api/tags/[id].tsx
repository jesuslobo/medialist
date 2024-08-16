import { db } from '@/db';
import { listsTagsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { validatedID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/tags/[id]
 * Get: Get a tag by ID
 * Patch: Update a tag by ID
 * Delete: Delete a tag by ID
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id: tagID } = req.query;
        if (!validatedID(tagID)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const tag = await db
                .select()
                .from(listsTagsTable)
                .where(and(
                    eq(listsTagsTable.userId, user.id),
                    eq(listsTagsTable.id, tagID as TagData['id']),
                ));

            return res.status(200).json(tag[0]);
        }

        //need more validation
        if (req.method === 'PATCH') {
            const { label, description, groupName, badgeable } = req.body;

            let tagData: Partial<TagData> = {
                label,
                description,
                groupName,
                badgeable: badgeable == 'true' ? true : false
            }

            const data = await db
                .update(listsTagsTable)
                .set(tagData)
                .where(and(
                    eq(listsTagsTable.userId, user.id),
                    eq(listsTagsTable.id, tagID as TagData['id']),
                ))
                .returning()

            return res.status(200).json(data);
        }

        if (req.method === 'DELETE') {
            const data = await db
                .delete(listsTagsTable)
                .where(and(
                    eq(listsTagsTable.userId, user.id),
                    eq(listsTagsTable.id, tagID as TagData['id']),
                ))
                .returning()

            return res.status(200).json(data[0])
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/lists/[id]/tags: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}