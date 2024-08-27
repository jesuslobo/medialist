import { db } from '@/db';
import { itemsTable } from '@/db/schema';
import { validateAuthCookies } from '@/utils/lib/auth';
import { validatedID } from '@/utils/lib/generateID';
import { ItemData } from '@/utils/types/item';
import { and, eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/items/[id]
 * Get:  gets an item by id
 * Put:  updates an item by id // Not Implemented Yet
 * Delete: deletes an item by id // Not Implemented Yet
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        if (!validatedID(id)) return res.status(400).json({ message: 'Bad Request' });

        const { user } = await validateAuthCookies(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        //should check if list exists
        if (req.method === 'GET') {
            const item = await db
                .select()
                .from(itemsTable)
                .where(and(
                    eq(itemsTable.userId, user.id),
                    eq(itemsTable.id, id as ItemData['id'])
                ))
            return res.status(200).json(item[0]);
        }


        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.log("[Error] api/items/[id]: ", error)
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

export const config = {
    api: {
        bodyParser: false,
    },
};