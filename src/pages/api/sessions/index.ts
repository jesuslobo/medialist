import { db } from '@/server/db';
import { usersTable } from '@/server/db/schema';
import { $verifyPassword } from '@/server/utils/auth/auth';
import { $setSessionTokenCookie, $validateAuthCookies } from '@/server/utils/auth/cookies';
import { $createSession, $generateSessionToken, $invalidateSession } from '@/server/utils/auth/session';
import parseJSONReq from '@/utils/functions/parseJSONReq';
import { validatePassword, validateUsername } from '@/utils/lib/validate';
import { eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

/** api/sessions
 * Get: Returns All Sessions (Not Implemented)
 * Post: Create a Session - Login
 * Delete: Destroy a Session - Logout
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const body = parseJSONReq(await req.body);

      const { username, password } = body as { username: string, password: string };
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

      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username.toLowerCase()));

      if (!users[0]) return res.status(400).json({ message: 'Invalid Username Or Password' })
      const { passwordHash, ...user } = users[0];

      const validPassword = await $verifyPassword(password, passwordHash);
      if (!validPassword) return res.status(400).json({ message: 'Invalid Username Or Password' })

      const token = $generateSessionToken();
      const session = await $createSession(token, user.id, req.headers['user-agent']);

      $setSessionTokenCookie(res, token, session.expiresAt);
      res.status(200).json(user);
    }

    if (req.method === 'DELETE') {
      const { session } = await $validateAuthCookies(req, res);
      if (!session) return res.status(401).json({ message: 'Unauthorized' });

      await $invalidateSession(session.id);
      res.status(200).json({ message: 'Logged Out' });
    }

    res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error("[Error] api/sessions: ", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}