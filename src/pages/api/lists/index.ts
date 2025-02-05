import { $createLists, $getLists } from '@/server/db/queries/lists';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $getDir from '@/server/utils/file/getDir';
import { $LIST_FORM_SCHEMA } from '@/server/utils/lib/form/fromSchema';
import $processFormData, { ProcessedFormData } from '@/server/utils/lib/processFormData';
import { generateID } from '@/utils/lib/generateID';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/
 * Get: Get all lists of a user (query: trash)
 * Post: Create a new list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = await $validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
      const trash = req.query.trash === 'true';
      const lists = await $getLists(user.id, trash);
      return res.status(200).json(lists);
    }

    if (req.method === 'POST') {
      const id = generateID();

      const dir = await $getDir(user.id, id, true);
      const form = $processFormData<ListData & ProcessedFormData>($LIST_FORM_SCHEMA(dir.list));
      const { processFiles, processFields, data } = form;

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 1, files: 2, fileSize: 1024 * 1024 * 100 } // 100MB
      })

      bb.on('file', processFiles)
      bb.on('field', processFields)

      bb.on('close', async () => {
        if (!data.title) return res.status(400).json({ message: 'Invalid Request' });

        const createdAt = new Date(Date.now());
        const list = await $createLists({
          id: id,
          title: data.title,
          coverPath: data.coverPath,
          userId: user.id,
          createdAt,
          updatedAt: createdAt,
        })

        res.status(201).json(list[0]);
      })

      bb.on('error', (error) => {
        console.log("[Error] api/lists: ", error)
        res.status(500).json({ message: 'Internal Server Error' })
      })

      return req.pipe(bb);
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