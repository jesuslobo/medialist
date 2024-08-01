import { db } from '@/db';
import { listsTable } from '@/db/schema';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { validateAuthCookies } from '@/utils/lib/auth';
import { generateID } from '@/utils/lib/generateID';
import { eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/lists/
 * Get: Get all lists of a user
 * Post: Create a new list
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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

    const body = parseJSONReq(await req.body);

    const id = generateID();

    const list = await db.insert(listsTable).values({
      id: id,
      title: body.title,
      userId: user.id,
    }).returning();

    return res.status(201).json(list[0]);
  }

  res.status(405).json({ message: 'Method Not Allowed' });


}