import { db } from "@/server/db";
import { usersTable } from "@/server/db/schema";
import { $hashPassword } from "@/server/utils/auth/auth";
import { $createSession, $generateSessionToken } from "@/server/utils/auth/session";
import $deleteFolder from "@/server/utils/file/deleteFolder";
import { $generateID, $generateShortID } from "@/server/utils/lib/generateID";
import { eq } from "drizzle-orm";
import { mkdir } from "fs/promises";
import { join } from "path";

const SESSION_LOCAL_STORAGE_KEY = "session";

export default async function $mockUser(username?: string, password: string = 'testpassword', createdAt?: Date) {
    const passwordHash = await $hashPassword(password)

    const date = createdAt || new Date()
    const userData = await db.insert(usersTable).values({
        id: $generateShortID(),
        username: (username || $generateID(5).toLowerCase()),
        passwordHash,
        createdAt: date,
        updatedAt: date,
    }).returning()
    const user = userData[0]

    const dir = join('public', 'users', user.id)
    await mkdir(dir, { recursive: true })

    async function deleteUser() {
        await $deleteFolder(dir)
        await db.delete(usersTable).where(eq(usersTable.id, user.id)).limit(1)
    }

    async function createCookie() {
        const token = $generateSessionToken();
        const session = await $createSession(token, user.id);
        const cookies = { [SESSION_LOCAL_STORAGE_KEY]: token }

        return { token, session, cookies }
    }

    return {
        userData: {
            ...user,
            password
        },
        userDir: dir,
        delete: deleteUser,
        createCookie
    }
}