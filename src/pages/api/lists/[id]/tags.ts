import { db } from '@/server/db';
import { $getList } from '@/server/db/queries/lists';
import { $createTags, $getTags } from '@/server/db/queries/tags';
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

        const listsDb = await $getList(user.id, listID as ListData['id']);
        if (listsDb.length === 0) return res.status(404).json({ message: 'Not Found' });

        const list = listsDb[0];

        if (req.method === 'GET') {
            const tags = await $getTags(user.id, list.id)
            return res.status(200).json(tags);
        }

        if (req.method === 'POST') {
            const { label, description, groupName, badgeable } = body;
            if (!label) return res.status(400).json({ message: 'Bad Request' });

            const id = generateID()
            let tagData: TagData = {
                id,
                label,
                userId: user.id,
                listId: list.id,
                description,
                groupName,
                badgeable: badgeable || "",
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now())
            }

            const tag = await $createTags(tagData);

            return res.status(200).json(tag[0]);
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/lists/[id]/tags: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}