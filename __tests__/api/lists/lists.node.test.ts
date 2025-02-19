import listsRouter from '@/pages/api/lists';
import { THUMBNAILS_OPTIONS, thumbnailName } from '@/utils/lib/fileHandling/thumbnailOptions';
import { shortIdRegex } from '@/utils/lib/generateID';
import $mockList from '@tests/test-utils/mocks/data/mockList';
import $mockUser from '@tests/test-utils/mocks/data/mockUser';
import { TEST_MOCK_FILE_BUFFER, TEST_MOCK_FILE_NAME } from '@tests/test-utils/mocks/mockFile';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import FormData from 'form-data';
import { fs } from 'memfs';
import { join } from 'path';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/lists/', async () => {
    const file = await TEST_MOCK_FILE_BUFFER

    describe('GET - get all lists', async () => {
        test('should return all lists not in trash if trash query is undefined or false', async () => {
            const user = await $mockUser();
            const { userData } = user
            const { cookies } = await user.createCookie();
            const l1 = await $mockList({ title: 'List1' }, user);
            const l2 = await $mockList({ title: 'List2' }, user);
            const l3 = await $mockList({ title: 'List3', trash: true }, user);

            const req1 = await $mockHttp(listsRouter).get(undefined, { cookies });
            expect(req1.body).toEqual([
                {
                    id: l1.listData.id,
                    userId: userData.id,
                    title: 'List1',
                    coverPath: l1.listData.coverPath,
                    trash: false,
                    configs: "{}",
                    createdAt: l1.listData.createdAt.toISOString(),
                    updatedAt: l1.listData.updatedAt.toISOString(),
                },
                {
                    id: l2.listData.id,
                    userId: userData.id,
                    title: 'List2',
                    coverPath: null,
                    trash: false,
                    configs: "{}",
                    createdAt: l2.listData.createdAt.toISOString(),
                    updatedAt: l2.listData.updatedAt.toISOString(),
                }
            ])
            expect(req1.res.statusCode).toBe(200);

            const req2 = await $mockHttp(listsRouter).get(undefined, { cookies, params: { trash: 'false' } });
            expect(req2.body).toEqual([
                {
                    id: l1.listData.id,
                    userId: userData.id,
                    title: 'List1',
                    coverPath: l1.listData.coverPath,
                    trash: false,
                    configs: "{}",
                    createdAt: l1.listData.createdAt.toISOString(),
                    updatedAt: l1.listData.updatedAt.toISOString(),
                },
                {
                    id: l2.listData.id,
                    userId: userData.id,
                    title: 'List2',
                    coverPath: null,
                    trash: false,
                    configs: "{}",
                    createdAt: l2.listData.createdAt.toISOString(),
                    updatedAt: l2.listData.updatedAt.toISOString(),
                }
            ])
            expect(req2.res.statusCode).toBe(200);
            await user.delete();
        })

        test('should return all lists in trash if trash=true', async () => {
            const user = await $mockUser();
            const { userData } = user
            const { cookies } = await user.createCookie();
            const l1 = await $mockList({ title: 'List1', cover: true }, user);
            const l2 = await $mockList({ title: 'List2' }, user);
            const l3 = await $mockList({ title: 'List3', trash: true }, user);
            const { res, body } = await $mockHttp(listsRouter).get(undefined, { cookies, query: { trash: 'true' } });

            expect(body).toEqual([
                {
                    id: l3.listData.id,
                    userId: userData.id,
                    title: 'List3',
                    coverPath: null,
                    trash: true,
                    configs: "{}",
                    createdAt: l3.listData.createdAt.toISOString(),
                    updatedAt: l3.listData.updatedAt.toISOString(),
                }
            ])
            expect(res.statusCode).toBe(200);
            await user.delete();
        })

        test('should return empty array if no lists found', async () => {
            const { cookies } = await $mockUser().then(user => user.createCookie());
            const { res, body } = await $mockHttp(listsRouter).get(undefined, { cookies });

            expect(body).toEqual([]);
            expect(res.statusCode).toBe(200);
        })
    })

    describe('POST - create new list', () => {
        test('should create list with only a title', async () => {
            const formData = new FormData();
            formData.append('title', 'Test List');

            const { userData, ...user } = await $mockUser();
            const { cookies } = await user.createCookie();
            const { res, body } = await $mockHttp(listsRouter).post(formData, { cookies });

            expect(body).toEqual({
                id: expect.stringMatching(shortIdRegex),
                userId: userData.id,
                title: 'Test List',
                coverPath: null,
                trash: false,
                configs: "{}",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })

            const listDirExists = fs.existsSync(join(user.userDir, body.id))
            expect(listDirExists).toBe(true);

            expect(res.statusCode).toBe(201);

            await user.delete();
        })

        test('should create list with cover and generate thumbnails', async () => {
            const formData = new FormData();
            formData.append('title', 'Test List');
            formData.append('cover', file, TEST_MOCK_FILE_NAME);

            const { userData, ...user } = await $mockUser();
            const { cookies } = await user.createCookie();
            const { res, body } = await $mockHttp(listsRouter).post(formData, { cookies });

            expect(body).toEqual({
                id: expect.stringMatching(shortIdRegex),
                userId: userData.id,
                title: 'Test List',
                coverPath: expect.any(String),
                trash: false,
                configs: "{}",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
            expect(res.statusCode).toBe(201);

            const listDir = join(user.userDir, body.id)
            const coverExits = fs.existsSync(join(listDir, body.coverPath))
            expect(coverExits).toBe(true);

            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(body.coverPath, option)))).toBe(true)
            )

            await user.delete();
        })

        test('shouldn\'t create list without title', async () => {
            const { userData, ...user } = await $mockUser();
            const { cookies } = await user.createCookie();

            const formData = new FormData();
            formData.append('title', "");
            const r1 = await $mockHttp(listsRouter).post(formData, { cookies });

            expect(r1.body).toEqual({ message: 'Invalid Request' });
            expect(r1.res.statusCode).toBe(400);

            const r2 = await $mockHttp(listsRouter).post(new FormData(), { cookies });

            expect(r2.body).toEqual({ message: 'Invalid Request' });
            expect(r2.res.statusCode).toBe(400);

            await user.delete();
        })
    })
})