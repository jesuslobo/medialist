import { $getList, $updateLists } from '@/server/db/queries/lists';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFile from '@/server/utils/file/deleteFile';
import $getDir from '@/server/utils/file/getDir';
import { $LIST_FORM_SCHEMA } from '@/server/utils/lib/form/fromSchema';
import $processFormData, { ProcessedFormData } from '@/server/utils/lib/processFormData';
import { THUMBNAILS_OPTIONS } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validatedID } from '@/utils/lib/generateID';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/[id]
 * Get: Get a list by id
 * Delete: move a list to trash
 * PATCH: Update a list by id
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id: ListData['id'] };
    if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

    const { user } = await $validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const lists = await $getList(user.id, id);

    if (lists.length === 0)
      return res.status(404).json({ message: 'Not Found' });

    const list = lists[0];

    if (req.method === 'GET')
      return res.status(200).json(list);

    // move to trash
    if (req.method === 'DELETE') {
      const newData = {
        trash: true,
        updatedAt: new Date(Date.now())
      }
      const updatedList = await $updateLists(user.id, list.id, newData)

      return res.status(200).json(updatedList[0]);
    }

    if (req.method === 'PATCH') {
      const dir = await $getDir(user.id, list.id, true);
      const form = $processFormData<ListData & ProcessedFormData>($LIST_FORM_SCHEMA(dir.list));
      const { processFiles, processFields, data, promises } = form;

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 2, files: 2, fileSize: 1024 * 1024 * 100 } // 100MB
      })

      bb.on('file', processFiles)
      bb.on('field', processFields)

      bb.on('finish', async () => {
        if (data.coverPath !== undefined && list.coverPath && list.coverPath !== data.coverPath)
          $deleteFile(THUMBNAILS_OPTIONS.LIST_COVER, dir.list, list.coverPath);

        form.data.updatedAt = new Date(Date.now())
        const [updatedList] = await $updateLists(user.id, list.id, form.data)

        await Promise.all(promises);
        res.status(200).json(updatedList);
        console.log('[Edited] api/lists/[id]:', updatedList.id + ' ' + updatedList.title);
      })

      bb.on('error', (error) => {
        console.log("[Error] api/lists: ", error)
        res.status(500).json({ message: 'Internal Server Error' })
      })

      return req.pipe(bb)
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.log("[Error] api/lists: ", error)
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};