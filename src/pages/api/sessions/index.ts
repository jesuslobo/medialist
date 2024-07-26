import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { argon2Options, lucia, validateAuthCookies, validateUsername } from '@/utils/lib/auth';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/sessions
 * Get: Returns All Sessions (Not Yet Implemented)
 * Post: Create a Session - Login
 * Delete: Destroy a Session - Logout
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { username, password } = req.body
      if (!username || !password) return res.status(400).json({ error: 'Invalid Request' })

      if (validateUsername(username))
        return res.status(400).json({ error: { username: "Invalid Username" } })

      if (validateUsername(password))
        return res.status(400).json({ error: { password: "Invalid Password" } })

      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))

      const userExists = users[0]
      if (!userExists) return res.status(400).json({ error: 'Invalid Username Or Password' })

      const validPassword = await verify(users[0].passwordHash, password, argon2Options)
      if (!validPassword) return res.status(400).json({ error: 'Invalid Username Or Password' })

      const session = await lucia.createSession(userExists.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id).serialize();

      res
        .appendHeader('Set-Cookie', sessionCookie)
        .status(200)
        .json({
          username: userExists.username,
          id: userExists.id
        });
    }

    if (req.method === 'DELETE') {
      const { session } = await validateAuthCookies(req, res);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      await lucia.invalidateSession(session.id);
      const sessionCookie = lucia.createBlankSessionCookie().serialize();
      res.appendHeader('Set-Cookie', sessionCookie).status(200).json({ message: 'Logged Out' });
    }

    res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error) {
    console.error("[Error] api/sessions: ", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}