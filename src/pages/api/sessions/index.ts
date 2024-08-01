import { db } from '@/db';
import { usersTable } from '@/db/schema';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { argon2Options, lucia, validateAuthCookies, notValidPassword, notValidUsername } from '@/utils/lib/auth';
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
      const body = parseJSONReq(await req.body);

      const { username, password } = body;
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

      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))

      const userExists = users[0]
      if (!userExists) return res.status(400).json({ message: 'Invalid Username Or Password' })

      const validPassword = await verify(users[0].passwordHash, password, argon2Options)
      if (!validPassword) return res.status(400).json({ message: 'Invalid Username Or Password' })

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
      if (!session) return res.status(401).json({ message: 'Unauthorized' });

      await lucia.invalidateSession(session.id);
      const sessionCookie = lucia.createBlankSessionCookie().serialize();
      res.appendHeader('Set-Cookie', sessionCookie).status(200).json({ message: 'Logged Out' });
    }

    res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error("[Error] api/sessions: ", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}