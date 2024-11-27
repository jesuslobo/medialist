import { db } from '@/server/db';
import { listsTagsTable } from '@/server/db/schema';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { generateID, validatedID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ListData } from '@/utils/types/list';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/[id]/tags
 * Get: Get all tags of a list
 * Post: Add a tag to a list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const body = parseJSONReq(await req.body);
        const listID = req.query.id;

        if (!validatedID(listID)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const tags = await db
                .select()
                .from(listsTagsTable)
                .where(and(
                    eq(listsTagsTable.userId, user.id),
                    eq(listsTagsTable.listId, listID as ListData['id']),
                ));

            return res.status(200).json(tags);
        }

        //need more validation
        if (req.method === 'POST') {
            const { label, description, groupName, badgeable } = body;
            if (!label) return res.status(400).json({ message: 'Bad Request' });

            const id = generateID()
            let tagData: TagData = {
                id,
                label,
                userId: user.id,
                listId: listID as ListData['id'],
                description,
                groupName,
                badgeable: badgeable || ""
            }

            const tag = await db.insert(listsTagsTable)
                .values(tagData)
                .returning()

            return res.status(200).json(tag[0]);
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/lists/[id]/tags: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}