import listsRouter from '@/pages/api/lists/[id]/index';
import { THUMBNAILS_OPTIONS, thumbnailName } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID } from '@/utils/lib/generateID';
import $mockList from '@tests/test-utils/mocks/data/mockList';
import { TEST_MOCK_FILE_BUFFER, TEST_MOCK_FILE_NAME } from '@tests/test-utils/mocks/mockFile';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import FormData from 'form-data';
import { fs } from 'memfs';
import { join } from 'path';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/lists/[id]', async () => {
    const file = await TEST_MOCK_FILE_BUFFER

    describe('should return 404', () => {
        test('if a fake/unexisting list ID is provided', async () => {
            const { userMock } = await $mockList({ title: 'List1' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: generateID() } });
            expect(body).toEqual({ message: 'Not Found' });
            expect(statusCode).toBe(404);

            await user.delete();
        })

        test('if an ID of other user\'s list is provided', async () => {
            const { userMock } = await $mockList({ title: 'List1' });
            const { listData: otherUserList } = await $mockList({ title: 'List1' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: otherUserList.id } });
            expect(body).toEqual({ message: 'Not Found' });
            expect(statusCode).toBe(404);

            await user.delete();
        })
    })

    test('should return 400 Bad Request if an invalid ID is provided', async () => {
        const { userMock } = await $mockList({ title: 'List1' });
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const r1 = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: 'invalidID' } });
        expect(r1.body).toEqual({ message: 'Bad Request' });
        expect(r1.statusCode).toBe(400);

        const r2 = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: '' } });
        expect(r2.body).toEqual({ message: 'Bad Request' });
        expect(r2.statusCode).toBe(400);

        //to-add: 
        // const fakeString = 'a'.repeat(10 ** 10);
        // const r3 = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: fakeString } });
        // expect(r3.body).toEqual({ message: 'Bad Request' });
        // expect(r3.statusCode).toBe(400);

        await user.delete();
    })

    test('GET - should return list data when its ID is provided', async () => {
        const { listData, userMock } = await $mockList({ title: 'List1' });
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const { body, statusCode } = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: listData.id } });
        expect(body).toEqual({
            ...listData,
            updatedAt: listData.updatedAt.toISOString(),
            createdAt: listData.createdAt.toISOString()
        });
        expect(statusCode).toBe(200);

        await user.delete();
    })

    describe('PATCH - update list', () => {
        const fakeDate = { updatedAt: new Date(2000, 1), createdAt: new Date(2000, 1) }

        test('should only change title if only the title is changed', async () => {
            const form = new FormData();
            form.append('title', 'List3');

            const { listData, userMock } = await $mockList({ title: 'List1', ...fakeDate });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(listsRouter).patch(form, { cookies, query: { id: listData.id } });
            expect(body).toEqual({
                ...listData,
                title: 'List3',
                updatedAt: expect.not.stringMatching(listData.updatedAt.toISOString()),
                createdAt: listData.createdAt.toISOString()
            });
            expect(statusCode).toBe(200);

            await user.delete();
        })

        test('should keep cover if not updated', async () => {
            const { listData, userMock, listDir } = await $mockList({ cover: true, ...fakeDate });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const oldCoverDir = join(listDir, listData.coverPath as string);
            expect(fs.existsSync(oldCoverDir)).toBe(true);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(listData.coverPath as string, option)))).toBe(true)
            )

            const form = new FormData();
            form.append('title', 'List3');

            const { body, statusCode } = await $mockHttp(listsRouter).patch(form, { cookies, query: { id: listData.id } });
            expect(body).toEqual({
                ...listData,
                coverPath: listData.coverPath,
                title: 'List3',
                updatedAt: expect.not.stringMatching(listData.updatedAt.toISOString()),
                createdAt: listData.createdAt.toISOString()
            });
            expect(statusCode).toBe(200);

            expect(fs.existsSync(oldCoverDir)).toBe(true);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(listData.coverPath as string, option)))).toBe(true)
            )

            await user.delete();
        })

        test('should generate cover when added', async () => {
            const { listData, userMock, listDir } = await $mockList(fakeDate);
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const form = new FormData();
            form.append('cover', file, TEST_MOCK_FILE_NAME);
            const fileExtension = TEST_MOCK_FILE_NAME.split('.')[1];

            const { body, statusCode } = await $mockHttp(listsRouter).patch(form, { cookies, query: { id: listData.id } });

            expect(body).toEqual({
                ...listData,
                coverPath: expect.any(String),
                updatedAt: expect.not.stringMatching(listData.updatedAt.toISOString()),
                createdAt: listData.createdAt.toISOString(),
            });
            const coverDir = join(user.userDir, listData.id, body.coverPath);
            expect(fs.existsSync(coverDir)).toBe(true);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(body.coverPath, option)))).toBe(true)
            )

            expect(statusCode).toBe(200);

            await user.delete();
        })

        test('should update cover and generate new thumbnails, and delete old ones, if a new cover is added', async () => {
            const { listData, userMock, listDir } = await $mockList({ cover: true, ...fakeDate });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const oldCoverDir = join(user.userDir, listData.id, listData.coverPath as string);
            expect(fs.existsSync(oldCoverDir)).toBe(true);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(listData.coverPath as string, option)))).toBe(true)
            )

            const form = new FormData();
            form.append('cover', file, TEST_MOCK_FILE_NAME);
            const fileExtension = TEST_MOCK_FILE_NAME.split('.')[1];

            const { body, statusCode } = await $mockHttp(listsRouter).patch(form, { cookies, query: { id: listData.id } });

            expect(body).toEqual({
                ...listData,
                coverPath: expect.any(String),
                updatedAt: expect.not.stringMatching(listData.updatedAt.toISOString()),
                createdAt: listData.createdAt.toISOString(),
            });
            const coverDir = join(listDir, body.coverPath);

            //new cover exists
            expect(fs.existsSync(coverDir)).toBe(true);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(body.coverPath, option)))).toBe(true)
            )

            //old cover and thumbnails are deleted
            expect(fs.existsSync(oldCoverDir)).toBe(false);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(listData.coverPath as string, option)))).toBe(false)
            )

            expect(statusCode).toBe(200);

            await user.delete();
        })

        test('should delete the old cover if the cover is null', async () => {
            const { listData, userMock, listDir } = await $mockList({ cover: true, ...fakeDate });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const oldCoverDir = join(listDir, listData.coverPath as string);
            expect(fs.existsSync(oldCoverDir)).toBe(true);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(listData.coverPath as string, option)))).toBe(true)
            )

            const form = new FormData();
            form.append('cover', 'null');

            const { body, statusCode } = await $mockHttp(listsRouter).patch(form, { cookies, query: { id: listData.id } });

            expect(body).toEqual({
                ...listData,
                coverPath: null,
                updatedAt: expect.not.stringMatching(listData.updatedAt.toISOString()),
                createdAt: listData.createdAt.toISOString(),
            });
            expect(statusCode).toBe(200);

            // wait for files to be deleted
            await new Promise(res => setTimeout(res, 1000));
            //old cover and thumbnails are deleted
            expect(fs.existsSync(oldCoverDir)).toBe(false);
            THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
                expect(fs.existsSync(join(listDir, thumbnailName(listData.coverPath as string, option)))).toBe(false)
            )

            await user.delete();
        })
    })

    test('DELETE - move list to trash', async () => {
        const { listData, userMock } = await $mockList({ title: 'List1', createdAt: new Date(2000, 1), updatedAt: new Date(2000, 1) });
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const { body, statusCode } = await $mockHttp(listsRouter).delete(undefined, { cookies, query: { id: listData.id } });
        expect(body).toEqual({
            ...listData,
            trash: true,
            createdAt: listData.createdAt.toISOString(),
            updatedAt: expect.not.stringMatching(listData.updatedAt.toISOString()),
        });
        expect(statusCode).toBe(200);

        await user.delete();
    })
})