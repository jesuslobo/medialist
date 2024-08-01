import { db } from '@/db';
import { listsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { validatedID } from '@/utils/lib/generateID';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next'


/** api/lists/[id])
 * Get: Get a list by id
 * Put: Update a list by id // Not Yet Implemented
 * Delete: Delete a list by id
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

  if (req.method === 'GET') {
    const { user } = await validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

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
    const { user } = await validateAuthCookies(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const list = await db
      .delete(listsTable)
      .where(and(
        eq(listsTable.userId, user.id),
        eq(listsTable.id, id as string)
      ))
      .returning();

    return res.status(200).json(list[0]);
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}