import trashHandler from '@/pages/api/trash';
import { db } from '@/server/db';
import { itemsTable, listsTable } from '@/server/db/schema';
import { $generateShortID } from '@/server/utils/lib/generateID';
import { $mockItem } from '@tests/test-utils/mocks/data/mockItem';
import $mockList from '@tests/test-utils/mocks/data/mockList';
import $mockUser from '@tests/test-utils/mocks/data/mockUser';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import { eq } from 'drizzle-orm';
import { fs } from 'memfs';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/trash', () => {
    describe('GET - get all trash lists and items of a user', () => {
        test('should return all trash lists and items', async () => {
            const user = await $mockUser();
            const { listData: l1 } = await $mockList({ trash: true }, user);
            const { listData: l2 } = await $mockList({ trash: true }, user);
            const { listData: l3 } = await $mockList({ trash: true }); // of another user

            const { itemData: item1 } = await $mockItem({ trash: true }, user);
            const { itemData: item2 } = await $mockItem({ trash: true }, user);
            const { itemData: item3 } = await $mockItem({ trash: true }); // of another user

            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(trashHandler).get(undefined, { cookies });

            expect(body).toEqual([
                { id: l1.id, listId: null, title: l1.title, coverPath: l1.coverPath, updatedAt: l1.updatedAt.toISOString() },
                { id: l2.id, listId: null, title: l2.title, coverPath: l2.coverPath, updatedAt: l2.updatedAt.toISOString() },
                { id: item1.id, listId: item1.listId, title: item1.title, coverPath: item1.posterPath, updatedAt: item1.updatedAt },
                { id: item2.id, listId: item2.listId, title: item2.title, coverPath: item2.posterPath, updatedAt: item2.updatedAt },
            ]);
            expect(statusCode).toBe(200);

            await user.delete();
        })

        test('should an empty array if no lists and items in trash', async () => {
            const user = await $mockUser();
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(trashHandler).get(undefined, { cookies });

            expect(body).toEqual([]);
            expect(statusCode).toBe(200);

            await user.delete();
        })
    })

    describe('Delete - delete provided items & lists and their media', () => {
        test('should return 400 Bad Request if invalid ids provided', async () => {
            const user = await $mockUser();
            const { cookies } = await user.createCookie();

            const req1 = await $mockHttp(trashHandler).delete({
                lists: ['invalid-id'],
                items: ['invalid-id']
            }, { cookies });

            expect(req1.body).toEqual({ message: 'Bad Request' });
            expect(req1.statusCode).toBe(400);

            await user.delete();
        })

        test('should return 400 Bad Request if no real/owned items or lists ids provided', async () => {
            const user = await $mockUser();
            const { cookies } = await user.createCookie();

            const { listData: list1 } = await $mockList({ trash: true }, user);
            const { listData: list2 } = await $mockList({ trash: true }); // of another user

            const { itemData: item1 } = await $mockItem({ trash: true }, user);
            const { itemData: item2 } = await $mockItem({ trash: true }); // of another user

            const req1 = await $mockHttp(trashHandler).delete({
                lists: [$generateShortID(), list2.id],
                items: [$generateShortID(), item2.id]
            }, { cookies });

            const req2 = await $mockHttp(trashHandler).delete({
                lists: [list1.id, $generateShortID(), list2.id],
                items: [item1.id, $generateShortID(), item2.id]
            }, { cookies });

            expect(req1.body).toEqual({ message: 'Bad Request' });
            expect(req1.statusCode).toBe(400);

            expect(req2.body).toEqual({ message: 'Bad Request' });
            expect(req2.statusCode).toBe(400);

            await user.delete();
        })

        test('should delete provided items and lists and their media', async () => {
            const user = await $mockUser();
            const { listData: list1, listDir: list1Dir } = await $mockList({ trash: true, cover: true }, user);
            const { listData: list2, listDir: list2Dir } = await $mockList({ trash: true, cover: true }, user);

            const { itemData: item1, itemDir: item1Dir } = await $mockItem({ trash: true, poster: true }, user);
            const { itemData: item2, itemDir: item2Dir } = await $mockItem({ trash: true, poster: true }, user);

            expect(fs.existsSync(list1Dir)).toBe(true)
            expect(fs.existsSync(list2Dir)).toBe(true)
            expect(fs.existsSync(item1Dir)).toBe(true)
            expect(fs.existsSync(item2Dir)).toBe(true)

            const { cookies } = await user.createCookie();

            const reqBody = {
                lists: [list1.id, list2.id],
                items: [item1.id, item2.id]
            }
            const { body, statusCode } = await $mockHttp(trashHandler).delete(reqBody, { cookies })

            await new Promise(setImmediate)

            expect(body).toEqual({ message: 'Deleted' });

            expect(fs.existsSync(list1Dir)).toBe(false)
            expect(fs.existsSync(list2Dir)).toBe(false)
            expect(fs.existsSync(item1Dir)).toBe(false)
            expect(fs.existsSync(item2Dir)).toBe(false)

            expect(statusCode).toBe(200);
        })

        test('should delete items if lists are not provided', async () => {
            const user = await $mockUser();
            const { itemData: item1, itemDir: item1Dir } = await $mockItem({ trash: true, poster: true }, user);
            const { itemData: item2, itemDir: item2Dir } = await $mockItem({ trash: true, poster: true }, user);

            expect(fs.existsSync(item1Dir)).toBe(true)
            expect(fs.existsSync(item2Dir)).toBe(true)

            const { cookies } = await user.createCookie();

            const reqBody = {
                items: [item1.id, item2.id]
            }
            const { body, statusCode } = await $mockHttp(trashHandler).delete(reqBody, { cookies })

            await new Promise(setImmediate)

            expect(body).toEqual({ message: 'Deleted' });

            expect(fs.existsSync(item1Dir)).toBe(false)
            expect(fs.existsSync(item2Dir)).toBe(false)

            expect(statusCode).toBe(200);
        })

        test('should delete lists if items are not provided', async () => {
            const user = await $mockUser();
            const { listData: list1, listDir: list1Dir } = await $mockList({ trash: true, cover: true }, user);
            const { listData: list2, listDir: list2Dir } = await $mockList({ trash: true, cover: true }, user);

            expect(fs.existsSync(list1Dir)).toBe(true)
            expect(fs.existsSync(list2Dir)).toBe(true)

            const { cookies } = await user.createCookie();

            const reqBody = {
                lists: [list1.id, list2.id]
            }
            const { body, statusCode } = await $mockHttp(trashHandler).delete(reqBody, { cookies })

            await new Promise(setImmediate)

            expect(body).toEqual({ message: 'Deleted' });

            expect(fs.existsSync(list1Dir)).toBe(false)
            expect(fs.existsSync(list2Dir)).toBe(false)

            expect(statusCode).toBe(200);
        })
    })

    describe('Patch - restore provided items & lists', () => {
        test('should return 400 Bad Request if invalid ids provided', async () => {
            const user = await $mockUser();
            const { cookies } = await user.createCookie();

            const req1 = await $mockHttp(trashHandler).patch({
                lists: ['invalid-id'],
                items: ['invalid-id']
            }, { cookies });

            expect(req1.body).toEqual({ message: 'Bad Request' });
            expect(req1.statusCode).toBe(400);

            await user.delete();
        })

        test('should return 400 Bad Request if no real/owned items or lists ids provided', async () => {
            const user = await $mockUser();
            const { cookies } = await user.createCookie();

            const { listData: list1 } = await $mockList({ trash: true }, user);
            const { listData: list2 } = await $mockList({ trash: true }); // of another user

            const { itemData: item1 } = await $mockItem({ trash: true }, user);
            const { itemData: item2 } = await $mockItem({ trash: true }); // of another user

            const req1 = await $mockHttp(trashHandler).patch({
                lists: [$generateShortID(), list2.id],
                items: [$generateShortID(), item2.id]
            }, { cookies });

            const req2 = await $mockHttp(trashHandler).patch({
                lists: [list1.id, $generateShortID(), list2.id],
                items: [item1.id, $generateShortID(), item2.id]
            }, { cookies });

            expect(req1.body).toEqual({ message: 'Bad Request' });
            expect(req1.statusCode).toBe(400);

            expect(req2.body).toEqual({ message: 'Bad Request' });
            expect(req2.statusCode).toBe(400);

            await user.delete();
        })


        test('should restore provided items and lists', async () => {
            const user = await $mockUser();
            const { listData: list1 } = await $mockList({ trash: true, updatedAt: new Date(2000, 1) }, user);
            const { listData: list2 } = await $mockList({ trash: true, updatedAt: new Date(2000, 1) }, user);
            const { listData: list3 } = await $mockList({ trash: true }); // of another user

            const { itemData: item1 } = await $mockItem({ trash: true, updatedAt: new Date(2000, 1) }, user);
            const { itemData: item2 } = await $mockItem({ trash: true, updatedAt: new Date(2000, 1) }, user);
            const { itemData: item3 } = await $mockItem({ trash: true }); // of another user

            const { cookies } = await user.createCookie();

            const reqBody = {
                lists: [list1.id, list2.id],
                items: [item1.id, item2.id]
            }

            const { body: { lists, items }, statusCode } = await $mockHttp(trashHandler).patch(reqBody, { cookies });

            expect(statusCode).toBe(200);

            expect(items).toEqual([
                { ...item1, trash: false, updatedAt: expect.not.stringMatching(item1.updatedAt) },
                { ...item2, trash: false, updatedAt: expect.not.stringMatching(item2.updatedAt) },
            ]);

            expect(lists).toEqual([
                {
                    ...list1, trash: false,
                    createdAt: list1.createdAt.toISOString(),
                    updatedAt: expect.not.stringMatching(list1.updatedAt.toISOString())
                },
                {
                    ...list2, trash: false,
                    createdAt: list2.createdAt.toISOString(),
                    updatedAt: expect.not.stringMatching(list2.updatedAt.toISOString())
                },
            ]);

            const otherUserListDb = await db.select().from(listsTable).where(eq(listsTable.id, list3.id))
            expect(otherUserListDb).toEqual([{ ...list3, trash: true }])

            const otherUserItemDb = await db.select().from(itemsTable).where(eq(itemsTable.id, item3.id))
            expect(otherUserItemDb).toEqual([{
                ...item3,
                trash: true,
                createdAt: new Date(item3.createdAt),
                updatedAt: new Date(item3.updatedAt)
            }])

            await user.delete();
        })

        test('should restore items if lists are not provided', async () => {
            const user = await $mockUser();

            const { itemData: item1 } = await $mockItem({ trash: true, updatedAt: new Date(2000, 1) }, user);
            const { itemData: item2 } = await $mockItem({ trash: true, updatedAt: new Date(2000, 1) }, user);

            const { cookies } = await user.createCookie();

            const reqBody = {
                items: [item1.id, item2.id]
            }

            const { body: { lists, items }, statusCode } = await $mockHttp(trashHandler).patch(reqBody, { cookies });

            expect(statusCode).toBe(200);

            expect(items).toEqual([
                { ...item1, trash: false, updatedAt: expect.not.stringMatching(item1.updatedAt) },
                { ...item2, trash: false, updatedAt: expect.not.stringMatching(item2.updatedAt) },
            ]);

            expect(lists).toEqual([]);

            await user.delete();
        })

        test('should restore lists if items are not provided', async () => {
            const user = await $mockUser();

            const { listData: list1 } = await $mockList({ trash: true, updatedAt: new Date(2000, 1) }, user);
            const { listData: list2 } = await $mockList({ trash: true, updatedAt: new Date(2000, 1) }, user);

            const { cookies } = await user.createCookie();

            const reqBody = {
                lists: [list1.id, list2.id]
            }

            const { body: { lists, items }, statusCode } = await $mockHttp(trashHandler).patch(reqBody, { cookies });

            expect(statusCode).toBe(200);

            expect(lists).toEqual([
                { ...list1, trash: false, updatedAt: expect.not.stringMatching(list1.updatedAt.toISOString()), createdAt: list1.createdAt.toISOString() },
                { ...list2, trash: false, updatedAt: expect.not.stringMatching(list2.updatedAt.toISOString()), createdAt: list2.createdAt.toISOString() },
            ]);

            expect(items).toEqual([]);

            await user.delete();
        })

        test('should return 400 Bad Request if no items or lists are provided', async () => {
            const user = await $mockUser();
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(trashHandler).patch({}, { cookies });

            expect(body).toEqual({ message: 'Bad Request' });
            expect(statusCode).toBe(400);

            await user.delete();
        })
    })

})