import { $deleteTags, $getTag, $updateTag } from '@/server/db/queries/tags';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { validateLongID } from '@/utils/lib/generateID';
import { TagData } from '@/utils/types/global';
import { ApiErrorCode, ServerResponse } from '@/utils/types/serverResponse';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/tags/[id]
 * Get: Get a tag by ID
 * Patch: Update a tag by ID
 * Delete: Delete a tag by ID
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { user } = await $validateAuthCookies(req, res);
        if (!user)
            return res.status(401).json({ errorCode: ApiErrorCode.UNAUTHORIZED });

        const { id: tagID } = req.query;
        if (!validateLongID(tagID))
            return res.status(400).json({ errorCode: ApiErrorCode.BAD_REQUEST } as ServerResponse)

        const tagsDb = await $getTag(user.id, tagID as TagData['id']);
        if (tagsDb.length === 0)
            return res.status(404).json({ errorCode: ApiErrorCode.NOT_FOUND });
        const tag = tagsDb[0];

        if (req.method === 'GET') {
            return res.status(200).json(tag);
        }

        if (req.method === 'PATCH') {
            const { label, description, groupName, badgeable } = parseJSONReq(await req.body);

            let tagData: Partial<TagData> = {
                label,
                description,
                groupName,
                badgeable: badgeable || "",
                updatedAt: new Date()
            }

            const [updatedTag] = await $updateTag(user.id, tag.id, tagData);
            return res.status(200).json(updatedTag);
        }

        if (req.method === 'DELETE') {
            const [deleteTag] = await $deleteTags(user.id, tag.id);
            return res.status(200).json(deleteTag)
        }

        res.status(405).json({ errorCode: ApiErrorCode.METHOD_NOT_ALLOWED });
    } catch (error) {
        console.log("[Error] api/tags/[id]: ", error)
        res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR });
    }
}