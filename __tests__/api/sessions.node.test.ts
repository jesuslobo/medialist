import sessionsHandler from '@/pages/api/sessions';
import { db } from '@/server/db';
import { sessionsTable } from '@/server/db/schema';
import $mockUser from '@tests/test-utils/mocks/data/mockUser';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import { eq, sql } from 'drizzle-orm';
import { vol } from 'memfs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

beforeEach(() => vol.reset())

describe('api/sessions/', () => {
    describe('GET - get all sessions data of the User', () => {
        test('should return all sessions with a fakeID', async () => {
            const { userData: { id }, ...user } = await $mockUser();
            const { cookies } = await user.createCookie();
            await user.createCookie(); // create another session
            const { body, statusCode } = await $mockHttp(sessionsHandler).get(undefined, { cookies });

            const sessions = await getAllSessions(id);

            expect(body).toEqual([
                {
                    id: sessions[0].id,
                    agent: {},
                    createdAt: sessions[0].createdAt.toISOString(),
                    expiresAt: sessions[0].expiresAt.toISOString(),
                },
                {
                    id: sessions[1].id,
                    agent: {},
                    createdAt: sessions[1].createdAt.toISOString(),
                    expiresAt: sessions[1].expiresAt.toISOString(),
                }
            ])

            expect(statusCode).toBe(200)
            await user.delete()
        })
    })

    describe('POST - login / create a session', () => {
        test('should login with correct username and password', async () => {
            const { userData: { username, id, password, createdAt, updatedAt }, ...user } = await $mockUser()
            const { body, statusCode, headers } = await $mockHttp(sessionsHandler).post({ username, password });

            expect(body).toEqual({
                id,
                username,
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
            })
            expect(headers).toHaveProperty('set-cookie')
            expect(statusCode).toBe(200)

            await user.delete()
        })

        test('shouldn\'t login with incorrect username', async () => {
            const { userData: { password }, ...user } = await $mockUser()
            const { body, statusCode } = await $mockHttp(sessionsHandler).post({ username: 'wrongusername', password });

            expect(body).toEqual({ message: 'Invalid Username Or Password' })
            expect(statusCode).toBe(400)

            await user.delete()
        })

        test('shouldn\'t login with incorrect password', async () => {
            const { userData: { username }, ...user } = await $mockUser()
            const { body, statusCode } = await $mockHttp(sessionsHandler).post({ username, password: 'wrongpassword' });

            expect(body).toEqual({ message: 'Invalid Username Or Password' })
            expect(statusCode).toBe(400)

            await user.delete()
        })

        test('shouldn\'t login without username', async () => {
            const { userData: { password }, ...user } = await $mockUser()
            const { body, statusCode } = await $mockHttp(sessionsHandler).post({ password });

            expect(body).toEqual({ message: 'Invalid Request' })
            expect(statusCode).toBe(400)

            await user.delete()
        })

        test('shouldn\'t login without password', async () => {
            const { userData: { username }, ...user } = await $mockUser()
            const { body, statusCode } = await $mockHttp(sessionsHandler).post({ username });

            expect(body).toEqual({ message: 'Invalid Request' })
            expect(statusCode).toBe(400)

            await user.delete()
        })
    })

    describe('DELETE - logout / destroy a session', () => {
        test('should logout', async () => {
            const user = await $mockUser()
            const { cookies } = await user.createCookie()
            const { body, statusCode } = await $mockHttp(sessionsHandler).delete(undefined, { cookies });

            expect(body).toEqual({ message: 'Logged Out' })
            expect(statusCode).toBe(200)

            await user.delete()
        })
    })
})

describe('api/sessions/[id]', () => {
    test('DELETE - delete a session with the given first 10 chars of its ID', async () => {
        const { userData: { id }, ...user } = await $mockUser();
        const { cookies } = await user.createCookie();
        const sessions = await getAllSessions(id);

        const params = { id: (sessions[0].id as string).slice(0, 10) }
        const { body, statusCode } = await $mockHttp(sessionsHandler).delete(undefined, { cookies, params });

        expect(body).toEqual({ message: 'Logged Out' })
        expect(statusCode).toBe(200)

        const sessionsAfterDelete = await getAllSessions(id);
        expect(sessionsAfterDelete.length).toBe(0)

        await user.delete()
    })
})

const getAllSessions = async (userId: string) => await db
    .select({
        id: sql`substr(${sessionsTable.id}, 1,10)`,
        agent: sessionsTable.agent,
        expiresAt: sessionsTable.expiresAt,
        createdAt: sessionsTable.createdAt
    })
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))