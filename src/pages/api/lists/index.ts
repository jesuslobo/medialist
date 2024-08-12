import { db } from '@/db';
import { listsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import handleFileUpload from '@/utils/lib/fileHandling/handleFileUpload';
import { coverThumbnailsOptions } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID } from '@/utils/lib/generateID';
import { ListData } from '@/utils/types/list';
import busboy from 'busboy';
import { eq } from 'drizzle-orm';
import { mkdir } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

/** api/lists/
 * Get: Get all lists of a user
 * Post: Create a new list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    if (req.method === 'GET') {
      const { user } = await validateAuthCookies(req, res);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const lists = await db
        .select()
        .from(listsTable)
        .where(eq(listsTable.userId, user.id))
        .orderBy(listsTable.title);

      return res.status(200).json(lists);
    }

    // currently dev
    if (req.method === 'POST') {
      const { user } = await validateAuthCookies(req, res);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const id = generateID();

      let data: Partial<ListData> = {
        id,
        userId: user.id,
        title: undefined,
        coverPath: undefined
      }

      const listDir = join('public', 'users', user.id, id);
      const thumbnailsDir = join(listDir, 'thumbnails')
      await mkdir(thumbnailsDir, { recursive: true });

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 1, files: 1, fileSize: 1024 * 1024 * 100 } // 100MB
      })

      bb.on('file', (name, file, info) => {
        if (name === 'cover')
          data.coverPath = handleFileUpload(file, listDir, {
            thumbnails: coverThumbnailsOptions.listCover,
            fileName: info.filename
          })
      })

      bb.on('field', (name, val, info) => {
        if (name === 'title') data.title = val;
      })

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
      // bb.on('close', () => {
      //   console.log('Done parsing form!');
      //   res.writeHead(200, { Connection: 'close', Location: '/' });
      //   res.end();
      // })

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