import { db } from '@/server/db';
import { sessionsTable } from '@/server/db/schema';
import { $deleteSessionTokenCookie, $validateAuthCookies } from '@/server/utils/auth/cookies';
import { $invalidateSession } from '@/server/utils/auth/session';
import { ApiCode, ApiErrorCode, ServerResponse } from '@/utils/types/serverResponse';
import { and, eq, like } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/sessions/[id]
 * Delete: delete a session starting with the given first 10 chars of its ID
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const id = req.query.id as string;
        if (req.method === 'DELETE') {
            if (!id || id.length !== 10)
                return res.status(400).json({
                    errorCode: ApiErrorCode.BAD_REQUEST,
                    message: 'Invalid Session ID'
                } as ServerResponse);

            const { user, session } = await $validateAuthCookies(req, res);
            if (!user)
                return res.status(401).json({ errorCode: ApiErrorCode.UNAUTHORIZED } as ServerResponse);

            if (session.id.startsWith(id)) {
                $invalidateSession(session.id);
                $deleteSessionTokenCookie(res);
                return res.status(200).json({
                    message: 'logout',
                    code: ApiCode.DESTROYED
                } as ServerResponse);
            }

            const sessions = await db
                .delete(sessionsTable)
                .where(and(
                    eq(sessionsTable.userId, user.id),
                    like(sessionsTable.id, id + '%')
                )).limit(1)
                .returning()

            if (!sessions.length) return res.status(404).json({
                message: 'Session Not Found',
                errorCode: ApiErrorCode.NOT_FOUND
            } as ServerResponse);

            return res.status(200).json({
                message: 'Session Destroyed',
                code: ApiCode.DESTROYED,
            } as ServerResponse);
        }

        return res.status(405).json({ errorCode: ApiErrorCode.METHOD_NOT_ALLOWED } as ServerResponse);

    } catch (error) {
        console.error("[Error] api/sessions: ", error);
        res.status(500).json({ errorCode: ApiErrorCode.INTERNAL_SERVER_ERROR } as ServerResponse);
    }
}