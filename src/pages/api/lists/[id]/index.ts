import { db } from '@/server/db';
import { listsTable } from '@/server/db/schema';
import { $validateAuthCookies } from '@/server/utils/auth/cookies';
import $deleteFile from '@/server/utils/file/deleteFile';
import $getDir from '@/server/utils/file/getDir';
import { $listFormOptions } from '@/server/utils/lib/form/formData.options';
import $processFormData, { ProcessedFormData } from '@/server/utils/lib/processFormData';
import { coverThumbnailsOptions } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validatedID } from '@/utils/lib/generateID';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/[id]
 * Get: Get a list by id
 * PATCH: Update a list by id
 * Delete: Delete a list by id
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id: ListData['id'] };
    if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

    const { user } = await $validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
      const list = await db
        .select()
        .from(listsTable)
        .where(and(
          eq(listsTable.userId, user.id),
          eq(listsTable.id, id as string)
        )).limit(1);

      if (list.length === 0)
        return res.status(404).json({ message: 'Not Found' });

      return res.status(200).json(list[0]);

    }

    if (req.method === 'DELETE') {
      const list = await db
        .delete(listsTable)
        .where(and(
          eq(listsTable.userId, user.id),
          eq(listsTable.id, id as string)
        )).limit(1)
        .returning();

      if (list.length === 0)
        return res.status(404).json({ message: 'Not Found' });

      return res.status(200).json(list[0]);
    }

    if (req.method === 'PATCH') {
      const listReq = await db.select().from(listsTable).where(and(
        eq(listsTable.userId, user.id),
        eq(listsTable.id, id)
      )).limit(1);

      if (listReq.length === 0)
        return res.status(404).json({ message: 'Not Found' });

      const list = listReq[0] as ListData // original list

      const dir = await $getDir(user.id, list.id, true);
      const form = await $processFormData<ListData & ProcessedFormData>($listFormOptions(dir.list));
      const { processFiles, processFields, data } = form;

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 2, files: 2, fileSize: 1024 * 1024 * 100 } // 100MB
      })

      bb.on('file', processFiles)
      bb.on('field', processFields)

      bb.on('finish', async () => {
        if (data.coverPath !== undefined && list.coverPath && list.coverPath !== data.coverPath)
          $deleteFile(coverThumbnailsOptions.listCover, dir.list, list.coverPath);

        form.data.updatedAt = new Date(Date.now())

        const updatedList = await db
          .update(listsTable)
          .set(form.data)
          .where(
            and(
              eq(listsTable.userId, user.id),
              eq(listsTable.id, list.id)
            )
          ).limit(1)
          .returning();

        res.status(200).json(updatedList[0]);
        console.log('[Edited] api/lists/[id]:', updatedList[0].id + ' ' + updatedList[0].title);
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