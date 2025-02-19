import { $getList } from '@/server/db/queries/lists';
import { $createTags, $getTags } from '@/server/db/queries/tags';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import { $generateLongID } from '@/server/utils/lib/generateID';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { validateShortID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ListData } from '@/utils/types/list';
import { ApiErrorCode } from '@/utils/types/serverResponse';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/[id]/tags
 * Get: Get all tags of a list
 * Post: Add a tag to a list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const body = parseJSONReq(await req.body);
        const listID = req.query.id;

        if (!validateShortID(listID))
            return res.status(400).json({ errorCode: ApiErrorCode.BAD_REQUEST });

        const { user } = await $validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ errorCode: ApiErrorCode.UNAUTHORIZED });

        const listsDb = await $getList(user.id, listID as ListData['id']);
        if (listsDb.length === 0) return res.status(404).json({ errorCode: ApiErrorCode.NOT_FOUND });

        const list = listsDb[0];

        if (req.method === 'GET') {
            const tags = await $getTags(user.id, list.id)
            return res.status(200).json(tags);
        }

        if (req.method === 'POST') {
            const { label, description, groupName, badgeable } = body;
            if (!label) return res.status(400).json({ errorCode: ApiErrorCode.BAD_REQUEST });

            const id = $generateLongID()
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

        res.status(405).json({ errorCode: ApiErrorCode.METHOD_NOT_ALLOWED });
    } catch (error) {
        console.log("[Error] api/lists/[id]/tags: ", error)
        res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR });
    }
}