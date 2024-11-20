import { db } from '@/db';
import { listsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { coverThumbnailsOptions, thumbnailName } from '@/utils/lib/fileHandling/thumbnailOptions';
import { validatedID } from '@/utils/lib/generateID';
import $deleteFile from '@/utils/server/fileHandling/deleteFile';
import $handleListForm, { HandleListFormData } from '@/utils/server/handleListForm';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

/** api/lists/[id]
 * Get: Get a list by id
 * PATCH: Update a list by id
 * Delete: Delete a list by id
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id: ListData['id'] };
    if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

    const { user } = await validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
      const list = await db
        .select()
        .from(listsTable)
        .where(and(
          eq(listsTable.userId, user.id),
          eq(listsTable.id, id as string)
        ));

      return res.status(200).json(list[0]);

    }

    if (req.method === 'DELETE') {
      const list = await db
        .delete(listsTable)
        .where(and(
          eq(listsTable.userId, user.id),
          eq(listsTable.id, id as string)
        ))
        .returning();

      return res.status(200).json(list[0]);
    }

    if (req.method === 'PATCH') {
      const listReq = await db.select().from(listsTable).where(and(
        eq(listsTable.userId, user.id),
        eq(listsTable.id, id)
      ))

      if (listReq.length === 0)
        return res.status(404).json({ message: 'Not Found' });

      const list = listReq[0] as ListData // original list

      const form = await $handleListForm<listForm>(user.id, list.id);
      const { handleFields, handleFiles, data } = form;

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 2, files: 2, fileSize: 1024 * 1024 * 100 } // 100MB
      })

      bb.on('file', handleFiles)
      bb.on('field', (name, value) => {
        handleFields(name, value)
        switch (name) { // when the cover is deleted, the client will send a null => Boolean(JSON.parse(null)) = false
          case 'cover': form.data.coverIsDeleted = !Boolean(JSON.parse(value)); break
        }
      })

      bb.on('finish', async () => {
        if (form.data.coverIsDeleted && !form.data.coverPath)
          form.data.coverPath = null as any // drizzle does not accept undefined

        const deletedMedia = deletedMediaPaths(form.data, list, form.dir.list)
        Promise.all(deletedMedia.map(path => $deleteFile(path)))

        delete form.data.coverIsDeleted

        const updatedList = await db.update(listsTable).set(form.data).where(
          and(
            eq(listsTable.userId, user.id),
            eq(listsTable.id, list.id)
          )
        ).returning();

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

function deletedMediaPaths(formData: listForm, oldData: ListData, listDir: string) {
  let deletedMedia = []

  if ((formData.coverPath || formData.coverIsDeleted) && typeof oldData.coverPath === 'string') {
    deletedMedia.push(join(listDir, oldData.coverPath))
    coverThumbnailsOptions.listCover.forEach(thumbnailOption => {
      const thumbnailPath = join(listDir, thumbnailName(oldData.coverPath as string, thumbnailOption))
      deletedMedia.push(thumbnailPath)
    })
  }
  return deletedMedia
}


interface listForm extends HandleListFormData {
  coverIsDeleted?: boolean
}