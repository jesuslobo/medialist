import { db } from '@/server/db';
import { sessionsTable } from '@/server/db/schema';
import { $deleteSessionTokenCookie, $validateAuthCookies } from '@/server/utils/auth/cookies';
import { $invalidateSession } from '@/server/utils/auth/session';
import { and, eq, like } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/sessions/[id]
 * Delete: delete a session starting with the given first 10 chars of its ID
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const id = req.query.id as string;
        if (req.method === 'DELETE') {
            if (!id || id.length !== 10) return res.status(400).json({ message: 'Invalid Request' })

            const { user, session } = await $validateAuthCookies(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });

            if (session.id.startsWith(id)) {
                $invalidateSession(session.id);
                $deleteSessionTokenCookie(res);
                return res.status(200).json({ message: 'logout' });
            }

            const sessions = await db
                .delete(sessionsTable)
                .where(and(
                    eq(sessionsTable.userId, user.id),
                    like(sessionsTable.id, id + '%')
                )).limit(1)
                .returning()

            if (!sessions.length) return res.status(404).json({ message: 'Session Not Found' });

            return res.status(200).json({ message: 'Session Destroyed' });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error("[Error] api/sessions: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}