import { $getList, $updateLists } from '@/server/db/queries/lists';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFile from '@/server/utils/file/deleteFile';
import $getDir from '@/server/utils/file/getDir';
import { $LIST_FORM_SCHEMA } from '@/server/utils/lib/form/fromSchema';
import $parseFormData, { ProcessedFormData } from '@/server/utils/lib/form/parseFormData';
import { THUMBNAILS_OPTIONS } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validateShortID } from '@/utils/lib/generateID';
import { ListData } from '@/utils/types/list';
import { ApiErrorCode } from '@/utils/types/serverResponse';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/[id]
 * Get: Get a list by id
 * Delete: move a list to trash
 * PATCH: Update a list by id
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = await $validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ errorCode: ApiErrorCode.UNAUTHORIZED })

    const { id } = req.query as { id: ListData['id'] };
    if (!validateShortID(id)) return res.status(400).json({ errorCode: ApiErrorCode.BAD_REQUEST })

    const lists = await $getList(user.id, id);

    if (lists.length === 0)
      return res.status(404).json({ errorCode: ApiErrorCode.NOT_FOUND })

    const list = lists[0];

    if (req.method === 'GET')
      return res.status(200).json(list);

    // move to trash
    if (req.method === 'DELETE') {
      const newData = {
        trash: true,
        updatedAt: new Date(Date.now())
      }
      const [updatedList] = await $updateLists(user.id, list.id, newData)
      return res.status(200).json(updatedList);
    }

    if (req.method === 'PATCH') {
      const dir = await $getDir(user.id, list.id, true);
      const bbConfig = {
        headers: req.headers,
        limits: { fields: 3, files: 2, fileSize: 1024 * 1024 * 100 } // 100MB
      }
      const form = $parseFormData<ListData & ProcessedFormData>(
        $LIST_FORM_SCHEMA(dir.list),
        bbConfig,
        async (data) => {
          if (data.coverPath !== undefined && list.coverPath && list.coverPath !== data.coverPath)
            $deleteFile(THUMBNAILS_OPTIONS.LIST_COVER, dir.list, list.coverPath);

          data.updatedAt = new Date(Date.now())
          const [updatedList] = await $updateLists(user.id, list.id, data)
          res.status(200).json(updatedList);
          console.log('[Edited] api/lists/[id]:', updatedList.id + ' ' + updatedList.title);
        }
      )

      form.on('error', (error) => {
        console.log("[Error] api/lists: ", error)
        res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR })
      })

      return req.pipe(form)
    }

    res.status(405).json({ errorCode: ApiErrorCode.METHOD_NOT_ALLOWED })
  } catch (error) {
    console.log("[Error] api/lists: ", error)
    res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};