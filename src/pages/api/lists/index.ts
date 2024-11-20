import { db } from '@/db';
import { listsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { generateID } from '@/utils/lib/generateID';
import $handleListForm from '@/utils/server/handleListForm';
import busboy from 'busboy';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/
 * Get: Get all lists of a user
 * Post: Create a new list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = await validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
      const lists = await db
        .select()
        .from(listsTable)
        .where(and(
          eq(listsTable.userId, user.id),
          eq(listsTable.trash, false)
        ))
        .orderBy(listsTable.title);

      return res.status(200).json(lists);
    }

    // currently dev
    if (req.method === 'POST') {
      const id = generateID();

      const form = await $handleListForm(user.id, id);
      const { handleFields, handleFiles, data } = form;

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 1, files: 2, fileSize: 1024 * 1024 * 100 } // 100MB
      })

      bb.on('file', handleFiles)
      bb.on('field', handleFields)

      bb.on('close', async () => {
        if (!data.title) return res.status(400).json({ message: 'Invalid Request' });

        const list = await db.insert(listsTable).values({
          id: id,
          title: data.title,
          coverPath: data.coverPath,
          userId: user.id,
        }).returning();

        res.status(201).json(list[0]);
      })

      bb.on('error', () =>
        res.status(500).json({ message: 'Internal Server Error' })
      )

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