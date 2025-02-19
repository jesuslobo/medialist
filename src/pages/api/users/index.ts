import { db } from '@/server/db';
import { usersTable } from '@/server/db/schema';
import { $hashPassword, $verifyPassword } from '@/server/utils/auth/auth';
import { $setSessionTokenCookie, $validateAuthCookies } from '@/server/utils/auth/cookies';
import { $createSession, $generateSessionToken } from '@/server/utils/auth/session';
import { $generateShortID } from '@/server/utils/lib/generateID';
import { validatePassword, validateUsername } from '@/utils/lib/validate';
import { ServerResponseError } from '@/utils/types/global';
import { eq } from 'drizzle-orm';
import { mkdir } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

let adminUserExistsCache: Boolean; // cache

/** api/users
 * Get: Returns the Authenticated User's Data
 * Post: User Register
 * Patch: Edit User's Data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const { user } = await $validateAuthCookies(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });
            const userRes = { ...user, passwordHash: undefined }

            return res.status(200).json(userRes);
        }

        if (req.method === 'POST') {
            const body = await req.body;
            const { username: reqUser, password } = JSON.parse(body || {})
            const username = reqUser?.toLowerCase()

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

            const userID = $generateShortID()
            const createdAt = new Date(Date.now())

            const adminUserExists = await checkForAdminUserExists();
            const role = adminUserExists ? 'user' : 'admin';

            const user = await db
                .insert(usersTable)
                .values({
                    id: userID,
                    username,
                    role,
                    passwordHash,
                    createdAt,
                    updatedAt: createdAt
                })
                .returning({ id: usersTable.id, username: usersTable.username, role: usersTable.role })

            const userDir = join('public', 'users', userID)
            await mkdir(userDir, { recursive: true }) // create media directory

            const token = $generateSessionToken();
            const session = await $createSession(token, user[0].id, req.headers['user-agent']);

            $setSessionTokenCookie(res, token, session.expiresAt)
            return res.status(201).json(user[0])
        }

        if (req.method === 'PATCH') {
            const { user } = await $validateAuthCookies(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });
            const body = await req.body;
            const { newUsername: reqNewUser, newPassword, oldPassword } = JSON.parse(body || {})

            let dbHashNewPassword;
            let dbNewUsernameReq;

            if (!oldPassword) return res.status(400).json({
                cause: { oldPassword: "Required" },
                message: 'Invalid Request'
            } as Error)

            const validOldPassword = await $verifyPassword(oldPassword, user.passwordHash);
            if (!validOldPassword) return res.status(400).json({
                cause: { oldPassword: "Invalid Old Password" },
                message: 'Invalid Request'
            } as Error)

            if (newPassword) {
                if (!validatePassword(newPassword))
                    return res.status(400).json({
                        cause: { newPassword: "Invalid Password" },
                        message: 'Invalid Request'
                    } as Error)

                dbHashNewPassword = await $hashPassword(newPassword)
            }

            if (reqNewUser) {
                const newUsername = reqNewUser.toLowerCase()

                if (!validateUsername(newUsername))
                    return res.status(400).json({
                        cause: { username: "Invalid Username" },
                        message: 'Invalid Request'
                    } as Error)

                const userExists = await db.select().from(usersTable).where(eq(usersTable.username, newUsername))
                if (userExists.length !== 0) return res.status(400).json({
                    cause: { username: 'User Already Exists' },
                    message: 'Invalid Request'
                } as ServerResponseError)

                dbNewUsernameReq = newUsername
            }
            const updatedAt = new Date(Date.now())

            const updatedUser = await db
                .update(usersTable)
                .set({
                    username: dbNewUsernameReq,
                    passwordHash: dbHashNewPassword,
                    updatedAt
                })
                .where(eq(usersTable.id, user.id))
                .limit(1)
                .returning()

            return res.status(200).json({ ...updatedUser[0], passwordHash: undefined })
        }

        res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error("[Error] api/users: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function checkForAdminUserExists() {
    if (adminUserExistsCache) return true;

    const exists = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
    const result = exists.length > 0;
    adminUserExistsCache = result
    return result;
}