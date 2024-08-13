import { db } from '@/db';
import { itemsTable, listsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { validatedID } from '@/utils/lib/generateID';
import { ListData } from '@/utils/types/list';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';


/** api/lists/[id]/items
 * Get: Get all items of a list
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id: listID } = req.query;
        if (!validatedID(listID)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.method === 'GET') {
            const items = await db
                .select()
                .from(itemsTable)
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.listId, listID as ListData['id']),
                    eq(itemsTable.trash, false)
                ));

            return res.status(200).json(items);
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/lists/[id]/items: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}