
import itemsRouter from '@/pages/api/items/[id]';
import { db } from '@/server/db';
import { listsTagsTable } from '@/server/db/schema';
import { thumbnailName, ThumbnailOptions, THUMBNAILS_OPTIONS } from '@/utils/lib/fileHandling/thumbnailOptions';
import { generateID } from '@/utils/lib/generateID';
import { ItemLayoutTab } from '@/utils/types/item';
import { $mockItem } from '@tests/test-utils/mocks/data/mockItem';
import $mockList from '@tests/test-utils/mocks/data/mockList';
import $mockTag from '@tests/test-utils/mocks/data/mockTag';
import { TEST_MOCK_FILE_BUFFER, TEST_MOCK_FILE_NAME } from '@tests/test-utils/mocks/mockFile';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import { and, eq, inArray } from 'drizzle-orm';
import FormData from 'form-data';
import { fs } from 'memfs';
import { join } from 'path';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/items/[id]', async () => {
    const file = await TEST_MOCK_FILE_BUFFER

    describe('should return 404', () => {
        test('if a fake/unexisting Item ID is provided', async () => {
            const { userMock, ...item } = await $mockItem({ title: 'Item' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: generateID() } });
            expect(body).toEqual({ message: 'Not Found' });
            expect(statusCode).toBe(404);

            await item.delete();
        })

        test('if an ID of other user\'s Item is provided', async () => {
            const { userMock, ...item } = await $mockItem({ title: 'Item' });
            const { itemData: otherUserItem } = await $mockItem({ title: 'Other User Item' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: otherUserItem.id } });
            expect(body).toEqual({ message: 'Not Found' });
            expect(statusCode).toBe(404);

            await item.delete();
        })
    })

    test('should return 400 Bad Request if an invalid ID is provided', async () => {
        const { userMock, ...item } = await $mockItem();
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const r1 = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: 'invalidID' } });
        expect(r1.body).toEqual({ message: 'Bad Request' });
        expect(r1.statusCode).toBe(400);

        const r2 = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: '' } });
        expect(r2.body).toEqual({ message: 'Bad Request' });
        expect(r2.statusCode).toBe(400);

        //to-add: 
        // const fakeString = 'a'.repeat(10 ** 10);
        // const r3 = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: fakeString } });
        // expect(r3.body).toEqual({ message: 'Bad Request' });
        // expect(r3.statusCode).toBe(400);

        await item.delete();
    })

    test('GET - get an item by ID', async () => {
        const { userMock, ...item } = await $mockItem();
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const { body, statusCode } = await $mockHttp(itemsRouter).get(undefined, { cookies, query: { id: item.itemData.id } });
        expect(body).toEqual(item.itemData);
        expect(statusCode).toBe(200);

        await item.delete();
    })

    describe('PATCH - update an item by ID', () => {
        test('should update title if provided, without modifying any other field or deleting any media', async () => {
            // implicitly tests that changing any field doesn't effect the others
            const list = await $mockList({ title: 'old title' });
            const { userMock } = list
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { tagData } = await $mockTag({ label: 'tag1' }, list)
            const item = await $mockItem({
                title: 'old title',
                description: 'old description',
                cover: true,
                poster: true,
                layout: [[
                    { type: 'one_row', label: 'test' },
                    [{ type: 'labelText', label: 'label', body: 'text', logo: true }]
                ]],
                header: { type: 'poster_beside', badges: [] },
                tags: [tagData.id],
                createdAt: new Date(2000, 1),
                updatedAt: new Date(2000, 1),
            }, list);

            const form = new FormData();
            form.append('title', 'new title');

            const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });
            expect(body.item).toEqual({
                ...item.itemData,
                title: 'new title',
                updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
            });

            const posterExists = fileExists(item.itemDir, item.itemData.posterPath as string, THUMBNAILS_OPTIONS.ITEM_POSTER)
            expect(posterExists).toBe(true)

            const coverExists = fileExists(item.itemDir, item.itemData.coverPath as string, THUMBNAILS_OPTIONS.ITEM_COVER)
            expect(coverExists).toBe(true)

            const logoPath = body.item.layout[0][1][0].logoPath
            const logoExists = fileExists(item.itemDir, logoPath, THUMBNAILS_OPTIONS.LOGO)
            expect(logoExists).toBe(true)
            expect(statusCode).toBe(200);

            await item.delete();
        })

        describe('update cover and poster', () => {
            test('should update cover, poster and generate their thumbnails if added', async () => {
                const { userMock, ...item } = await $mockItem({
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'label', body: 'text', logo: true }]
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });

                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const form = new FormData();
                form.append('cover', file, TEST_MOCK_FILE_NAME);
                form.append('poster', file, TEST_MOCK_FILE_NAME);

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });

                await new Promise(setImmediate)

                expect(body.item).toEqual({
                    ...item.itemData,
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    coverPath: expect.any(String),
                    posterPath: expect.any(String),
                });

                const newPosterExists = fileExists(item.itemDir, body.item.posterPath as string, THUMBNAILS_OPTIONS.ITEM_POSTER)
                expect(newPosterExists).toBe(true)

                const newCoverExists = fileExists(item.itemDir, body.item.coverPath as string, THUMBNAILS_OPTIONS.ITEM_COVER)
                expect(newCoverExists).toBe(true)

                const logoPath = body.item.layout[0][1][0].logoPath
                const logoExists = fileExists(item.itemDir, logoPath, THUMBNAILS_OPTIONS.LOGO)
                expect(logoExists).toBe(true)

                expect(statusCode).toBe(200);

                await item.delete();
            })

            test('should update cover & poster, generate new thumbnails, and delete the olds ', async () => {
                // implicitly tests that deleting certain media doesn't effect the others
                const { userMock, ...item } = await $mockItem({
                    cover: true,
                    poster: true,
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'label', body: 'text', logo: true }]
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });
                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const form = new FormData();
                form.append('cover', file, TEST_MOCK_FILE_NAME);
                form.append('poster', file, TEST_MOCK_FILE_NAME);

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });

                await new Promise(setImmediate)

                expect(body.item).toEqual({
                    ...item.itemData,
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    coverPath: expect.any(String),
                    posterPath: expect.any(String),
                });

                const newPosterExists = fileExists(item.itemDir, body.item.posterPath as string, THUMBNAILS_OPTIONS.ITEM_POSTER)
                expect(newPosterExists).toBe(true)

                const newCoverExists = fileExists(item.itemDir, body.item.coverPath as string, THUMBNAILS_OPTIONS.ITEM_COVER)
                expect(newCoverExists).toBe(true)

                const oldPosterExists = fileExists(item.itemDir, item.itemData.posterPath as string, THUMBNAILS_OPTIONS.ITEM_POSTER)
                expect(oldPosterExists).toBe(false)

                const oldCoverExists = fileExists(item.itemDir, item.itemData.coverPath as string, THUMBNAILS_OPTIONS.ITEM_COVER)
                expect(oldCoverExists).toBe(false)

                const logoPath = body.item.layout[0][1][0].logoPath
                const logoExists = fileExists(item.itemDir, logoPath, THUMBNAILS_OPTIONS.LOGO)
                expect(logoExists).toBe(true)

                expect(statusCode).toBe(200);

                await item.delete();
            })

            test('should delete poster and cover if provided as null', async () => {
                const { userMock, ...item } = await $mockItem({
                    cover: true,
                    poster: true,
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'label', body: 'text', logo: true }]
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });

                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const form = new FormData();
                form.append('cover', 'null');
                form.append('poster', 'null');

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });

                await new Promise(setImmediate)

                expect(body.item).toEqual({
                    ...item.itemData,
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    coverPath: null,
                    posterPath: null,
                });

                const posterExists = fileExists(item.itemDir, item.itemData.posterPath as string, THUMBNAILS_OPTIONS.ITEM_POSTER)
                expect(posterExists).toBe(false)

                const coverExists = fileExists(item.itemDir, item.itemData.coverPath as string, THUMBNAILS_OPTIONS.ITEM_COVER)
                expect(coverExists).toBe(false)

                const logoPath = body.item.layout[0][1][0].logoPath
                const logoExists = fileExists(item.itemDir, logoPath, THUMBNAILS_OPTIONS.LOGO)
                expect(logoExists).toBe(true)

                expect(statusCode).toBe(200);

                await item.delete();
            })
        })

        describe('update layout logo fields', () => {
            test('should only delete logos that are not in the new layout', async () => {
                const { userMock, ...item } = await $mockItem({
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'logoField1', body: 'text', logo: true }],
                        [{ type: 'labelText', label: 'logoField2', body: 'text', logo: true }],
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });

                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const logoPath1 = (item as any).itemData?.layout[0][1][0].logoPath
                const logo1Exists = fileExists(item.itemDir, logoPath1, THUMBNAILS_OPTIONS.LOGO)
                expect(logo1Exists).toBe(true)

                const logoPath2 = (item as any).itemData?.layout[0][2][0].logoPath
                const logo2Exists = fileExists(item.itemDir, logoPath2, THUMBNAILS_OPTIONS.LOGO)
                expect(logo2Exists).toBe(true)

                const form = new FormData();
                form.append('layout', JSON.stringify([
                    [
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'label', body: 'text' }],
                        [{ type: 'labelText', label: 'logoField2', body: 'still exists', logoPath: logoPath2 }],
                    ]
                ]));

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });
                await new Promise(setImmediate)

                expect(body.item).toEqual({
                    ...item.itemData,
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    layout: [
                        [
                            { type: 'one_row', label: 'test' },
                            [{ type: 'labelText', label: 'label', body: 'text' }],
                            [{ type: 'labelText', label: 'logoField2', body: 'still exists', logoPath: logoPath2 },]
                        ],
                    ]
                })

                const logo1StillExists = fileExists(item.itemDir, logoPath1, THUMBNAILS_OPTIONS.LOGO)
                expect(logo1StillExists).toBe(false)

                const logo2StillExists = fileExists(item.itemDir, logoPath2, THUMBNAILS_OPTIONS.LOGO)
                expect(logo2StillExists).toBe(true)

                expect(statusCode).toBe(200);

                await item.delete();
            })

            test('should upload new logos, and generate their thumbnails', async () => {
                const { userMock, ...item } = await $mockItem({
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'logoField1', body: 'text', logo: true }],
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });

                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const logoPath1 = (item as any).itemData?.layout[0][1][0].logoPath
                const logo1Exists = fileExists(item.itemDir, logoPath1, THUMBNAILS_OPTIONS.LOGO)
                expect(logo1Exists).toBe(true)

                const logoId = generateID()
                const form = new FormData();
                form.append('layout', JSON.stringify([
                    [
                        { type: 'two_rows', label: 'test' },
                        [{ type: 'labelText', label: 'label', body: 'text', logoPath: logoPath1 }],
                        [{ type: 'labelText', label: 'logoField2', body: 'text', logoPath: logoId }],
                    ]
                ]));

                form.append(`logoPaths[${logoId}]`, file, TEST_MOCK_FILE_NAME);

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });
                await new Promise(setImmediate)

                const logoPath2 = body.item.layout[0][2][0].logoPath

                expect(body.item).toEqual({
                    ...item.itemData,
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    layout: [
                        [
                            { type: 'two_rows', label: 'test' },
                            [{ type: 'labelText', label: 'label', body: 'text', logoPath: logoPath1 }],
                            [{ type: 'labelText', label: 'logoField2', body: 'text', logoPath: logoPath2 },]
                        ],
                    ]
                })

                const logo1StillExists = fileExists(item.itemDir, logoPath1, THUMBNAILS_OPTIONS.LOGO)
                expect(logo1StillExists).toBe(true)

                const logo2Exists = fileExists(item.itemDir, logoPath2, THUMBNAILS_OPTIONS.LOGO)
                expect(logo2Exists).toBe(true)

                expect(statusCode).toBe(200);

                await item.delete();
            })
        })

        describe('update tags', () => {
            test('should update tags if tags are provided', async () => {
                const listMock = await $mockList({ title: 'List' });
                const { userData, ...user } = listMock.userMock;
                const { cookies } = await user.createCookie();

                const { tagData: tag1 } = await $mockTag({ label: 'tag1' }, listMock)
                const { tagData: tag2 } = await $mockTag({ label: 'tag2' }, listMock)

                const item = await $mockItem({
                    tags: [tag1.id],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                }, listMock);

                const form = new FormData();
                form.append('tags', JSON.stringify([tag1.id, tag2.id]));

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });

                expect(body.item).toEqual({
                    ...item.itemData,
                    tags: [tag1.id, tag2.id],
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                });

                expect(statusCode).toBe(200);

                await listMock.delete();
            })

            test('should create new tags, by using unreal IDs as their labels', async () => {
                const listMock = await $mockList({ title: 'List' });
                const { userData, ...user } = listMock.userMock;
                const { cookies } = await user.createCookie();

                const { tagData: tag1 } = await $mockTag({ label: 'tag1' }, listMock)

                const item = await $mockItem({
                    tags: [tag1.id],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                }, listMock);

                const form = new FormData();
                // tags are provided by an array of IDs, of we provide a new 'ID',
                // it should create a new tag with that 'ID' as a name
                const fakeId = generateID()
                const { tagData: otherUserTag } = await $mockTag()

                form.append('tags', JSON.stringify([tag1.id, fakeId, otherUserTag.id, 'new Tag to be added']));

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });

                const tagsExist = await db
                    .select({ id: listsTagsTable.id })
                    .from(listsTagsTable)
                    .where(and(
                        eq(listsTagsTable.userId, userData.id),
                        inArray(listsTagsTable.label, ['new Tag to be added', otherUserTag.id, fakeId])
                    )).limit(3)

                expect(tagsExist).toHaveLength(3)

                expect(body.item).toEqual({
                    ...item.itemData,
                    tags: expect.arrayContaining([tag1.id, ...tagsExist.map(tag => tag.id)]),
                    updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                });

                expect(statusCode).toBe(200);
                await listMock.delete();
            })

            test('should not update tags if tags are not provided', async () => {
                const listMock = await $mockList();
                const { userData, ...user } = listMock.userMock;

                const { tagData: tag1 } = await $mockTag({ label: 'tag1' }, listMock)

                const { itemData } = await $mockItem({
                    tags: [tag1.id],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                }, listMock);

                const { cookies } = await user.createCookie();
                const form = new FormData();
                form.append('title', 'ddd');

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: itemData.id } });
                expect(body.item).toEqual({
                    ...itemData,
                    title: 'ddd',
                    updatedAt: expect.not.stringMatching(itemData.updatedAt),
                });

                expect(statusCode).toBe(200);

                await listMock.delete();
            })

            test('should update tags if an empty array is provided', async () => {
                const listMock = await $mockList({ title: 'List' });
                const { userData, ...user } = listMock.userMock;

                const { tagData: tag1 } = await $mockTag({ label: 'tag1' }, listMock)
                const { tagData: tag2 } = await $mockTag({ label: 'tag2' }, listMock)

                const { itemData } = await $mockItem({
                    tags: [tag1.id, tag2.id],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                }, listMock);

                const { cookies } = await user.createCookie();
                const form = new FormData();
                form.append('tags', JSON.stringify([]));

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: itemData.id } });

                expect(body.item).toEqual({
                    ...itemData,
                    tags: [],
                    updatedAt: expect.not.stringMatching(itemData.updatedAt),
                });

                expect(statusCode).toBe(200);
                await listMock.delete();
            })
        })

        describe('create media', () => {
            test('should create media if provided', async () => {
                const { userMock, ...item } = await $mockItem({
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'logoField1', body: 'text', logo: true }],
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });

                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const form = new FormData();
                const [imageID1, imageID2] = [generateID(10), generateID(10)]

                form.append('media', JSON.stringify([
                    { title: 'image1', path: imageID1, keywords: ['keyword1', 'keyword2'] },
                    { title: null, path: 'shouldIgnorethis' },
                    { path: imageID2 },
                ]))
                form.append(`mediaImages[${imageID1}]`, file, TEST_MOCK_FILE_NAME);
                form.append(`mediaImages[${imageID2}]`, file, TEST_MOCK_FILE_NAME);

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });
                await new Promise(setImmediate)

                expect(body).toEqual({
                    item: {
                        ...item.itemData,
                        updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    },
                    newTags: [],
                    newMedia: [
                        {
                            id: expect.any(String),
                            userId: userMock.userData.id,
                            itemId: item.itemData.id,
                            path: expect.any(String),
                            type: 'image',
                            title: 'image1',
                            keywords: ['keyword1', 'keyword2'],
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String)
                        },
                        {
                            id: expect.any(String),
                            userId: userMock.userData.id,
                            itemId: item.itemData.id,
                            path: expect.any(String),
                            type: 'image',
                            title: null,
                            keywords: [],
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String)
                        },
                    ]
                })

                const media1Exists = fileExists(item.itemDir, body.newMedia[0].path, [])
                expect(media1Exists).toBe(true)

                const media2Exists = fileExists(item.itemDir, body.newMedia[1].path, [])
                expect(media2Exists).toBe(true)
            })

            test('should create media and map it to an image field in the layout', async () => {
                const { userMock, ...item } = await $mockItem({
                    layout: [[
                        { type: 'one_row', label: 'test' },
                        [{ type: 'labelText', label: 'logoField1', body: 'text', logo: true }],
                    ]],
                    createdAt: new Date(2000, 1),
                    updatedAt: new Date(2000, 1),
                });

                const { userData, ...user } = userMock;
                const { cookies } = await user.createCookie();

                const form = new FormData();
                const imageID1 = generateID(10)

                form.append('media', JSON.stringify([
                    { title: 'image1', path: imageID1, keywords: ['keyword1', 'keyword2'] },
                    { title: null, path: 'shouldIgnorethis' },
                ]))
                form.append(`mediaImages[${imageID1}]`, file, TEST_MOCK_FILE_NAME);

                form.append('layout', JSON.stringify([
                    [{ type: 'one_row', label: 'tab1' }, [
                        { type: 'image', imageId: imageID1 },
                    ]],
                ] as ItemLayoutTab[]))

                const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });
                await new Promise(setImmediate)

                expect(body).toEqual({
                    item: {
                        ...item.itemData,
                        layout: [
                            [{ type: 'one_row', label: 'tab1' }, [
                                { type: 'image', imageId: body.newMedia[0].id },
                            ]],
                        ],
                        updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
                    },
                    newTags: [],
                    newMedia: [
                        {
                            id: expect.any(String),
                            userId: userMock.userData.id,
                            itemId: item.itemData.id,
                            path: expect.any(String),
                            type: 'image',
                            title: 'image1',
                            keywords: ['keyword1', 'keyword2'],
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String)
                        }
                    ]
                })

                const media1Exists = fileExists(item.itemDir, body.newMedia[0].path, [])
                expect(media1Exists).toBe(true)

                expect(statusCode).toBe(200);
            })

        })

        test('should update fav', async () => {
            const { userMock, ...item } = await $mockItem({
                createdAt: new Date(2000, 1),
                updatedAt: new Date(2000, 1),
            });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const form = new FormData();
            form.append('fav', JSON.stringify(true));

            const { body, statusCode } = await $mockHttp(itemsRouter).patch(form, { cookies, query: { id: item.itemData.id } });

            await new Promise(setImmediate)

            expect(body.item).toEqual({
                ...item.itemData,
                fav: true,
                updatedAt: expect.not.stringMatching(item.itemData.updatedAt),
            });

            expect(statusCode).toBe(200);

            await item.delete();
        })

    })

    test('DELETE - delete an item by ID', async () => {
        const { userMock, ...item } = await $mockItem();
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const { body, statusCode } = await $mockHttp(itemsRouter).delete(undefined, { cookies, query: { id: item.itemData.id } });
        expect(body).toEqual({ ...item.itemData, trash: true });
        expect(statusCode).toBe(200);

        await item.delete();
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