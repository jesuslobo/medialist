
import itemsRouter from '@/pages/api/lists/[id]/items';
import { coverThumbnailsOptions, thumbnailName, ThumbnailOptions } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID } from '@/utils/lib/generateID';
import { ItemData, ItemLayoutTab } from '@/utils/types/item';
import { $mockItem } from '@tests/test-utils/mocks/data/mockItem';
import $mockList from '@tests/test-utils/mocks/data/mockList';
import $mockTag from '@tests/test-utils/mocks/data/mockTag';
import { TEST_MOCK_FILE_BUFFER, TEST_MOCK_FILE_NAME } from '@tests/test-utils/mocks/mockFile';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import FormData from 'form-data';
import { fs } from 'memfs';
import { join } from 'path';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/lists/[id]/items', async () => {
    const file = await TEST_MOCK_FILE_BUFFER

    // to be added: 404, 400

    describe('GET - get all items of a list', async () => {
        test('should return all items of a list', async () => {
            const list = await $mockList();
            const { userMock, listData } = list
            const { cookies } = await userMock.createCookie();

            const i1 = await $mockItem({ poster: true, title: "item 1" }, list)
            const i2 = await $mockItem({ title: "item 2" }, list)
            const i3 = await $mockItem({ title: "item of another list" }, userMock)
            const i4 = await $mockItem({ title: "item of another user" })

            const req = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: listData.id } });

            expect(req.body).toEqual([i1.itemData, i2.itemData])
            expect(req.res.statusCode).toBe(200);

            await list.delete();
        })

        test('should return an empty array if no items are found', async () => {
            const list = await $mockList();
            const { userMock, listData } = list
            const { cookies } = await userMock.createCookie();

            const req = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: listData.id } });

            expect(req.body).toEqual([])
            expect(req.res.statusCode).toBe(200);

            await list.delete();
        })
    })

    describe('POST - create an item in the list', () => {
        // to add: default header, default layout,
        // to add: should check if that no item files are created when an error does occur

        test('should create item with title, poster, cover, layout (with logos), and tags (existing + new)', async () => {
            const list = await $mockList();
            const { listData, userMock } = list
            const { cookies } = await userMock.createCookie();

            const existingTags = await $mockTag({ label: 'existingTag' }, list)

            const form = new FormData();
            form.append('title', 'new item');
            form.append('description', 'new item description');

            form.append('header', JSON.stringify({ type: 'poster_beside' }))
            form.append('poster', file, TEST_MOCK_FILE_NAME);
            form.append('cover', file, TEST_MOCK_FILE_NAME);

            form.append('tags', JSON.stringify([
                existingTags.tagData.id,
                'newTag that will be created'
            ]))

            const logoID = generateID(10)
            form.append('layout', JSON.stringify([
                [{ type: 'one_row', label: 'tab1' }, [{ type: 'labelText', label: 'label', body: 'text', logoPath: logoID }]],
                [{ type: 'one_row', label: 'tab2' }, [{ type: 'labelText', label: 'label', body: 'text' }]],
            ] as ItemLayoutTab[]))
            form.append(`logoPaths[${logoID}]`, file, TEST_MOCK_FILE_NAME);


            const { body, statusCode } = await $mockHttp(itemsRouter).post(form, { cookies, query: { id: listData.id } });
            await new Promise(setImmediate)

            const item = body.item as ItemData

            expect(body).toEqual({
                item: {
                    id: expect.any(String),
                    userId: userMock.userData.id,
                    listId: listData.id,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    title: 'new item',
                    description: 'new item description',
                    posterPath: expect.any(String),
                    coverPath: expect.any(String),
                    layout: [
                        [
                            { type: 'one_row', label: 'tab1' },
                            [{ type: 'labelText', label: 'label', body: 'text', logoPath: expect.any(String) }]
                        ],
                        [
                            { type: 'one_row', label: 'tab2' },
                            [{ type: 'labelText', label: 'label', body: 'text' }]
                        ],
                    ],
                    header: { type: 'poster_beside' },
                    trash: false,
                    tags: [
                        existingTags.tagData.id,
                        expect.any(String),
                    ],
                },
                newTags: [{
                    id: expect.any(String),
                    listId: listData.id,
                    userId: userMock.userData.id,
                    label: 'newTag that will be created',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }]
            })

            const itemDir = join(list.listDir, item.id)

            const logoPath = body.item.layout[0][1][0].logoPath
            const logoExists = fileExists(itemDir, logoPath, coverThumbnailsOptions.itemLogo)
            expect(logoExists).toBe(true)

            const posterExists = fileExists(itemDir, item.posterPath as string, coverThumbnailsOptions.itemPoster)
            expect(posterExists).toBe(true)

            const coverExists = fileExists(itemDir, item.coverPath as string, coverThumbnailsOptions.itemCover)
            expect(coverExists).toBe(true)

            expect(statusCode).toBe(201);

            await list.delete();
        })

        test('should create item with only title', async () => {
            const list = await $mockList();
            const { listData, userMock } = list
            const { cookies } = await userMock.createCookie();

            const form = new FormData();
            form.append('title', 'new item');

            const { body, statusCode } = await $mockHttp(itemsRouter).post(form, { cookies, query: { id: listData.id } });
            await new Promise(setImmediate)

            const item = body.item as ItemData

            expect(body).toEqual({
                item: {
                    id: expect.any(String),
                    userId: userMock.userData.id,
                    listId: listData.id,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    title: 'new item',
                    trash: false,
                    tags: [],
                    layout: [],
                    header: {},
                    posterPath: null,
                    coverPath: null,
                    description: null,
                },
                newTags: []
            })

            expect(statusCode).toBe(201);

            await list.delete();
        })

        test('should return 400 if title is not provided', async () => {
            const list = await $mockList();
            const { listData, userMock } = list
            const { cookies } = await userMock.createCookie();

            const form = new FormData();

            const { body, statusCode } = await $mockHttp(itemsRouter).post(form, { cookies, query: { id: listData.id } });

            expect(body).toEqual({ message: 'Bad Request' })
            expect(statusCode).toBe(400);

            await list.delete();
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