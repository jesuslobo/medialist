import { db } from '@/server/db';
import { usersTable } from '@/server/db/schema';
import { $hashPassword } from '@/server/utils/auth/auth';
import { $setSessionTokenCookie, $validateAuthCookies } from '@/server/utils/auth/cookies';
import { $createSession, $generateSessionToken } from '@/server/utils/auth/session';
import { generateID } from '@/utils/lib/generateID';
import { validatePassword, validateUsername } from '@/utils/lib/validate';
import { ServerResponseError } from '@/utils/types/global';
import { eq } from 'drizzle-orm';
import { mkdir } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

/** api/users
 * Get: Returns the Authenticated User's Data
 * Post: User Register
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const { user } = await $validateAuthCookies(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });

            return res.status(200).json(user);
        }

        if (req.method === 'POST') {
            const body = await req.body;
            const { username: reqUser, password } = JSON.parse(body || {})
            const username = reqUser.toLowerCase()

            if (!username || !password) return res.status(400).json({ message: 'Invalid Request' })

            if (!validateUsername(username))
                return res.status(400).json({
                    cause: { username: "Invalid Username" },
                    message: 'Invalid Request'
                } as Error)

            if (!validatePassword(password))
                return res.status(400).json({
                    cause: { password: "Invalid Password" },
                    message: 'Invalid Request'
                } as Error)

            const userExists = await db.select().from(usersTable).where(eq(usersTable.username, username))

            if (userExists[0]) return res.status(400).json({
                cause: { username: 'User Already Exists' },
                message: 'Invalid Request'
            } as ServerResponseError)

            const passwordHash = await $hashPassword(password)

            const userID = generateID()
            const createdAt = new Date(Date.now())

            const user = await db
                .insert(usersTable)
                .values({
                    id: userID,
                    username,
                    passwordHash,
                    createdAt,
                    updatedAt: createdAt
                })
                .returning({ id: usersTable.id, username: usersTable.username })

            const userDir = join('public', 'users', userID)
            await mkdir(userDir, { recursive: true }) // create media directory

            const token = $generateSessionToken();
            const session = await $createSession(token, user[0].id);

            $setSessionTokenCookie(res, token, session.expiresAt)
            res.status(200).json(user[0])
        }

        res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error("[Error] api/users: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}