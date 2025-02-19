import usersRoute from '@/pages/api/users';
import { db } from '@/server/db';
import { usersTable } from '@/server/db/schema';
import { $verifyPassword } from '@/server/utils/auth/auth';
import { $generateID } from '@/server/utils/lib/generateID';
import { shortIdRegex } from '@/utils/lib/generateID';
import $mockUser from '@tests/test-utils/mocks/data/mockUser';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import { eq } from 'drizzle-orm';
import { fs, vol } from 'memfs';
import { join } from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

beforeEach(() => vol.reset())

describe('api/users/', () => {
    describe('GET - get userdata', () => {
        test('should get userdata via cookies', async () => {
            const { userData: { username, id, createdAt, updatedAt }, ...user } = await $mockUser()
            const { cookies } = await user.createCookie()
            const { body, statusCode } = await $mockHttp(usersRoute).get(undefined, { cookies });

            expect(body).toEqual({
                id,
                username,
                role: expect.stringMatching(/user|admin/),
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
            })
            expect(statusCode).toBe(200)

            await user.delete()
        })

        test('shouldn\'t get userdata without cookies', async () => {
            const { body, statusCode } = await $mockHttp(usersRoute).get();

            expect(body).toEqual({ message: 'Unauthorized' })
            expect(statusCode).toBe(401)
        })
    })

    describe('POST - register a new user', () => {
        test('should create a new user', async () => {
            const username = $generateID(5);
            const password = $generateID(6);

            const { body, statusCode, headers: reqHeaders } = await $mockHttp(usersRoute).post({ username, password });

            expect(body).toEqual({
                id: expect.stringMatching(shortIdRegex),
                role: expect.stringMatching(/user|admin/),
                username: username.toLowerCase(),
            })
            expect(statusCode).toBe(201)
            expect(reqHeaders).toHaveProperty('set-cookie')

            const userDir = join('public', 'users', body.id)
            const userDirExists = fs.existsSync(userDir)

            expect(userDirExists).toBe(true)

            await db.delete(usersTable).where(eq(usersTable.username, username.toLowerCase())).limit(1)
        })

        test('shouldn\'t create a new user with an existing username', async () => {
            const { userData: { username, password }, ...user } = await $mockUser()
            const { body, statusCode } = await $mockHttp(usersRoute).post({ username, password });

            expect(body).toEqual({
                cause: { username: "User Already Exists" },
                message: 'Invalid Request'
            })
            expect(statusCode).toBe(400)

            await user.delete()
        })

        test('shouldn\'t create a new user without a username', async () => {
            const { body, statusCode } = await $mockHttp(usersRoute).post({ password: 'testpassword' });

            expect(body).toEqual({ message: 'Invalid Request' })
            expect(statusCode).toBe(400)
        })

        test('shouldn\'t create a new user without a password', async () => {
            const { body, statusCode } = await $mockHttp(usersRoute).post({ username: 'testusername' });

            expect(body).toEqual({ message: 'Invalid Request' })
            expect(statusCode).toBe(400)
        })
    })

    describe('PATCH - change userdata', () => {
        test('should change username with valid old password', async () => {
            const oldDate = new Date(2000, 1)
            const { userData: { id, createdAt, updatedAt, password, username }, ...user } = await $mockUser(undefined, undefined, oldDate)
            const { cookies } = await user.createCookie()
            const newUsername = $generateID(5)

            const { body, statusCode } = await $mockHttp(usersRoute).patch({ newUsername, oldPassword: password }, { cookies });

            const newUser = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)

            const VerifyThatOldPasswordIsTheSame = await $verifyPassword(password, newUser[0].passwordHash)
            expect(VerifyThatOldPasswordIsTheSame).toBe(true)

            const VerifyThatUsernameChanged = newUser[0].username !== username
            expect(VerifyThatUsernameChanged).toBe(true)

            expect(body).toEqual({
                id,
                role: expect.stringMatching(/user|admin/),
                username: newUsername.toLowerCase(),
                createdAt: createdAt.toISOString(),
                updatedAt: expect.not.stringMatching(updatedAt.toISOString()),
            })

            expect(statusCode).toBe(200)
            await user.delete()
        })

        test('should change password with a valid old password', async () => {
            const oldDate = new Date(2000, 1)
            const { userData, ...user } = await $mockUser(undefined, undefined, oldDate)
            const { id, createdAt, updatedAt, password, username } = userData
            const { cookies } = await user.createCookie()
            const newPassword = $generateID(6)

            const { body, statusCode } = await $mockHttp(usersRoute).patch({ newPassword, oldPassword: password }, { cookies });

            const newUser = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)

            const verifyThatPasswordChanged = await $verifyPassword(newPassword, newUser[0].passwordHash)
            expect(verifyThatPasswordChanged).toBe(true)

            const VerifyThatUsernameIsTheSame = newUser[0].username === username
            expect(VerifyThatUsernameIsTheSame).toBe(true)

            expect(body).toEqual({
                id,
                role: expect.stringMatching(/user|admin/),
                username: username.toLowerCase(),
                createdAt: createdAt.toISOString(),
                updatedAt: expect.not.stringMatching(updatedAt.toISOString()),
            })

            expect(statusCode).toBe(200)

            await user.delete()
        })

        test('shouldn\'t change password or username with an invalid old password', async () => {
            const user = await $mockUser()
            const { cookies } = await user.createCookie()

            const reqBody = { newPassword: $generateID(6), username: "newUsername", oldPassword: 'invalidpasswordexample' }
            const { body, statusCode } = await $mockHttp(usersRoute).patch(reqBody, { cookies });

            const newUser = await db.select().from(usersTable).where(eq(usersTable.id, user.userData.id)).limit(1)

            const VerifyThatOldPasswordIsTheSame = await $verifyPassword(user.userData.password, newUser[0].passwordHash)
            expect(VerifyThatOldPasswordIsTheSame).toBe(true)

            const VerifyThatUsernameIsTheSame = newUser[0].username === user.userData.username
            expect(VerifyThatUsernameIsTheSame).toBe(true)

            expect(body).toEqual({
                cause: { oldPassword: "Invalid Old Password" },
                message: 'Invalid Request'
            })
            expect(statusCode).toBe(400)

            await user.delete()
        })

        test('shouldn\'t change password or username without an old password', async () => {
            const user = await $mockUser()
            const { cookies } = await user.createCookie()

            const reqBody = { newPassword: $generateID(6), username: "newUsername" }
            const { body, statusCode } = await $mockHttp(usersRoute).patch(reqBody, { cookies });

            const newUser = await db.select().from(usersTable).where(eq(usersTable.id, user.userData.id)).limit(1)

            const VerifyThatOldPasswordIsTheSame = await $verifyPassword(user.userData.password, newUser[0].passwordHash)
            expect(VerifyThatOldPasswordIsTheSame).toBe(true)

            const VerifyThatUsernameIsTheSame = newUser[0].username === user.userData.username
            expect(VerifyThatUsernameIsTheSame).toBe(true)

            expect(body).toEqual({
                cause: { oldPassword: "Required" },
                message: 'Invalid Request'
            })
            expect(statusCode).toBe(400)

            await user.delete()
        })
    })
})