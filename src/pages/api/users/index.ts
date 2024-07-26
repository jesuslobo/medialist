import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { argon2Options, lucia, validateAuthCookies, validateUsername } from '@/utils/lib/auth';
import { generateID } from '@/utils/lib/generateID';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

interface UserLoginData {
    username: string;
    password: string;
}
/** api/users
 * Get: Returns the Authenticated User's Data
 * Post: User Register
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const { user } = await validateAuthCookies(req, res);
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            return res.status(200).json(user);
        }

        if (req.method === 'POST') {
            const { username, password } = req.body
            if (!username || !password) return res.status(400).json({ error: 'Invalid Request' })

            if (validateUsername(username))
                return res.status(400).json({ error: { username: "Invalid Username" } })

            if (validateUsername(password))
                return res.status(400).json({ error: { password: "Invalid Password" } })

            const userExists = await db.select().from(usersTable).where(eq(usersTable.username, username))

            if (userExists[0]) return res.status(400).json({ error: { username: 'User Already Exists' } })

            const passwordHash = await hash(password, argon2Options)

            const userID = generateID()

            const user = await db
                .insert(usersTable)
                .values({ id: userID, username, passwordHash })
                .returning({ id: usersTable.id, username: usersTable.username })

            const session = await lucia.createSession(userID, {});
            const sessionCookie = lucia.createSessionCookie(session.id).serialize()

            res.appendHeader('Set-Cookie', sessionCookie).status(200).json(user[0])
        }

        res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error("[Error] api/users: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}