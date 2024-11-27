import { db } from '@/server/db';
import { usersTable } from '@/server/db/schema';
import { argon2Options, lucia, notValidPassword, notValidUsername, validateAuthCookies } from '@/utils/lib/auth';
import { generateID } from '@/utils/lib/generateID';
import { ServerResponseError } from '@/utils/types/global';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { mkdir } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

interface UserLoginData {
    username?: string;
    password?: string;
}
/** api/users
 * Get: Returns the Authenticated User's Data
 * Post: User Register
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const { user } = await validateAuthCookies(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });

            return res.status(200).json(user);
        }

        if (req.method === 'POST') {
            const body = await req.body;
            const { username, password } = JSON.parse(body || {})
            if (!username || !password) return res.status(400).json({ message: 'Invalid Request' })

            if (notValidUsername(username))
                return res.status(400).json({
                    cause: { username: "Invalid Username" },
                    message: 'Invalid Request'
                } as Error)

            if (notValidPassword(password))
                return res.status(400).json({
                    cause: { password: "Invalid Password" },
                    message: 'Invalid Request'
                } as Error)

            const userExists = await db.select().from(usersTable).where(eq(usersTable.username, username))

            if (userExists[0]) return res.status(400).json({
                cause: { username: 'User Already Exists' },
                message: 'Invalid Request'
            } as ServerResponseError)

            const passwordHash = await hash(password, argon2Options)

            const userID = generateID()

            const user = await db
                .insert(usersTable)
                .values({ id: userID, username, passwordHash })
                .returning({ id: usersTable.id, username: usersTable.username })

            const userDir = join('public', 'users', userID)
            await mkdir(userDir, { recursive: true }) // create media directory

            const session = await lucia.createSession(userID, {});
            const sessionCookie = lucia.createSessionCookie(session.id).serialize()

            res.appendHeader('Set-Cookie', sessionCookie).status(200).json(user[0])
        }

        res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error("[Error] api/users: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}