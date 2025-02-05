
import itemsMediaRouter from '@/pages/api/items/[id]/media';
import { thumbnailName, ThumbnailOptions, THUMBNAILS_OPTIONS } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID } from '@/utils/lib/generateID';
import { $mockItem } from '@tests/test-utils/mocks/data/mockItem';
import $mockItemMedia from '@tests/test-utils/mocks/data/mockItemMedia';
import { TEST_MOCK_FILE_BUFFER, TEST_MOCK_FILE_NAME } from '@tests/test-utils/mocks/mockFile';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import FormData from 'form-data';
import { fs } from 'memfs';
import { join } from 'path';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/items/[id]/media', async () => {
    const file = await TEST_MOCK_FILE_BUFFER

    describe('should return 404', () => {
        test('if a fake/unexisting Item ID is provided', async () => {
            const { userMock, ...item } = await $mockItem({ title: 'Item' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).get(undefined, { cookies, query: { id: generateID() } });
            expect(body).toEqual({ message: 'Not Found' });
            expect(statusCode).toBe(404);

            await item.delete();
        })

        test('if an ID of other user\'s Item is provided', async () => {
            const { userMock, ...item } = await $mockItem({ title: 'Item' });
            const { itemData: otherUserItem } = await $mockItem({ title: 'Other User Item' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).get(undefined, { cookies, query: { id: otherUserItem.id } });
            expect(body).toEqual({ message: 'Not Found' });
            expect(statusCode).toBe(404);

            await item.delete();
        })
    })

    test('should return 400 Bad Request if an invalid ID is provided', async () => {
        const { userMock, ...item } = await $mockItem();
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const r1 = await $mockHttp(itemsMediaRouter).get(undefined, { cookies, query: { id: 'invalidID' } });
        expect(r1.body).toEqual({ message: 'Bad Request' });
        expect(r1.statusCode).toBe(400);

        const r2 = await $mockHttp(itemsMediaRouter).get(undefined, { cookies, query: { id: '' } });
        expect(r2.body).toEqual({ message: 'Bad Request' });
        expect(r2.statusCode).toBe(400);

        //to-add: 
        // const fakeString = 'a'.repeat(10 ** 10);
        // const r3 = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: fakeString } });
        // expect(r3.body).toEqual({ message: 'Bad Request' });
        // expect(r3.statusCode).toBe(400);

        await item.delete();
    })

    describe('GET - gets all media of an item', () => {
        test('should return all media of an item', async () => {
            const item = await $mockItem();
            const { userData, ...user } = item.userMock;
            const { cookies } = await user.createCookie();

            const { mediaData: media1 } = await $mockItemMedia({}, item);
            const { mediaData: media2 } = await $mockItemMedia({}, item);

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).get(undefined, { cookies, query: { id: item.itemData.id } });
            expect(body).toEqual([media1, media2]);
            expect(statusCode).toBe(200);

            await item.delete();

        })

        test('should return an empty array if the item has no media', async () => {
            const item = await $mockItem();
            const { userData, ...user } = item.userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).get(undefined, { cookies, query: { id: item.itemData.id } });
            expect(body).toEqual([]);
            expect(statusCode).toBe(200);

            await item.delete();
        })
    })

    describe('POST - add media to an item', () => {
        test('should add a media to the item with title, and the image, and generate thumbnails', async () => {
            const { userMock, ...item } = await $mockItem();
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const form = new FormData();
            form.append('title', 'mediaTitle');
            form.append('path', file, TEST_MOCK_FILE_NAME);

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).post(form, { cookies, query: { id: item.itemData.id } });

            await new Promise(setImmediate);

            expect(body).toEqual({
                id: expect.any(String),
                userId: userData.id,
                itemId: item.itemData.id,
                title: 'mediaTitle',
                type: 'image',
                path: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });

            const MediaExists = fileExists(item.itemDir, body.path, THUMBNAILS_OPTIONS.ITEM_MEDIA);
            expect(MediaExists).toBe(true);

            expect(statusCode).toBe(200);
        })

        test('should add a media to the item without title', async () => {
            const { userMock, ...item } = await $mockItem();
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const form = new FormData();
            form.append('path', file, TEST_MOCK_FILE_NAME);

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).post(form, { cookies, query: { id: item.itemData.id } });

            await new Promise(setImmediate);

            expect(body).toEqual({
                id: expect.any(String),
                userId: userData.id,
                itemId: item.itemData.id,
                title: null,
                type: 'image',
                path: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });

            const MediaExists = fileExists(item.itemDir, body.path, THUMBNAILS_OPTIONS.ITEM_MEDIA);
            expect(MediaExists).toBe(true);

            expect(statusCode).toBe(200);
        })

        test('should return 400 Bad Request if no image is provided', async () => {
            const { userMock, ...item } = await $mockItem();
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const form = new FormData();
            form.append('title', 'mediaTitle');

            const { body, statusCode } = await $mockHttp(itemsMediaRouter).post(form, { cookies, query: { id: item.itemData.id } });

            expect(body).toEqual({ message: 'Bad Request' });
            expect(statusCode).toBe(400);
        })

    })
})

const fileExists = (dir: string, fileName: string, thumbnailOptions: ThumbnailOptions[]) => {
    const fileExisst = fs.existsSync(join(dir, fileName))

    const thumbnailsExists = thumbnailOptions
        ? thumbnailOptions.map((option) =>
            fs.existsSync(join(dir, thumbnailName(fileName, option)))
        ).every(Boolean)
        : true

    return fileExisst && thumbnailsExists
}