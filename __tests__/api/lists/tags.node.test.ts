import tagsRouter from '@/pages/api/lists/[id]/tags';
import $mockList from '@tests/test-utils/mocks/data/mockList';
import $mockTag from '@tests/test-utils/mocks/data/mockTag';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/lists/[id]/tags', async () => {

    // to add: currently returns an empty array
    //   describe('should return 404', () => {
    //         test('if a fake/unexisting list ID is provided', async () => {
    //             const { userMock } = await $mockList({ title: 'List1' });
    //             const { userData, ...user } = userMock;
    //             const { cookies } = await user.createCookie();

    //             const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: generateID() } });
    //             expect(body).toEqual({ message: 'Not Found' });
    //             expect(statusCode).toBe(404);

    //             await user.delete();
    //         })

    //         test('if an ID of other user\'s list is provided', async () => {
    //             const { listData, userMock } = await $mockList({ title: 'List1' });
    //             const { listData: otherUserList } = await $mockList({ title: 'List1' });
    //             const { userData, ...user } = userMock;
    //             const { cookies } = await user.createCookie();

    //             const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: otherUserList.id } });
    //             expect(body).toEqual({ message: 'Not Found' });
    //             expect(statusCode).toBe(404);

    //             await user.delete();
    //         })
    //     })
    //to add: it doesn't check if the list ID is valid

    test('should return 400 Bad Request if an invalid ID is provided', async () => {
        const { userMock } = await $mockList({ title: 'List1' });
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const r1 = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: 'invalidID' } });
        expect(r1.body).toEqual({ message: 'Bad Request' });
        expect(r1.statusCode).toBe(400);

        const r2 = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: '' } });
        expect(r2.body).toEqual({ message: 'Bad Request' });
        expect(r2.statusCode).toBe(400);

        //to-add: 
        // const fakeString = 'a'.repeat(10 ** 10);
        // const r3 = await $mockHttp(listsRouter).get(undefined, { cookies, query: { id: fakeString } });
        // expect(r3.body).toEqual({ message: 'Bad Request' });
        // expect(r3.statusCode).toBe(400);

        await user.delete();
    })

    describe('GET - get all tags of a list', () => {
        test('should return all tags of a list', async () => {
            const list = await $mockList();
            const { listData, userMock } = list;
            const { cookies } = await userMock.createCookie();

            const t1 = await $mockTag({ label: 'tag 1' }, list)
            const t2 = await $mockTag({ label: 'tag 2' }, list)
            const t3 = await $mockTag({ label: 'tag of another list' })

            const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: listData.id } });

            expect(body).toEqual([
                { ...t1.tagData, createdAt: t1.tagData.createdAt.toISOString(), updatedAt: t1.tagData.updatedAt.toISOString() },
                { ...t2.tagData, createdAt: t2.tagData.createdAt.toISOString(), updatedAt: t2.tagData.updatedAt.toISOString() },
            ])

            expect(statusCode).toBe(200)

            await list.delete()
        })

        test('should return an empty array if no tags are found', async () => {
            const list = await $mockList();
            const { listData, userMock } = list;
            const { cookies } = await userMock.createCookie();

            const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: listData.id } });

            expect(body).toEqual([])
            expect(statusCode).toBe(200)

            await list.delete()
        })
    })

    describe('POST - add a tag to a list', () => {
        /** Tags endpoint currently is the only JSON POST endpoint, the others are formdata */
        test('should add a tag to a list', async () => {
            const list = await $mockList();
            const { listData, userMock } = list;
            const { cookies } = await userMock.createCookie();

            const { body, statusCode } = await $mockHttp(tagsRouter).post({ label: 'new tag' }, { cookies, query: { id: listData.id } });

            expect(body).toEqual({
                id: expect.any(String),
                label: 'new tag',
                userId: userMock.userData.id,
                listId: listData.id,
                description: null,
                groupName: null,
                badgeable: '',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })

            expect(statusCode).toBe(200)

            await list.delete()
        })

        test('should return 400 Bad Request if no label is provided', async () => {
            const list = await $mockList();
            const { listData, userMock } = list;
            const { cookies } = await userMock.createCookie();

            const { body, statusCode } = await $mockHttp(tagsRouter).post({ description: 'description' }, { cookies, query: { id: listData.id } });

            expect(body).toEqual({ message: 'Bad Request' })
            expect(statusCode).toBe(400)

            await list.delete()
        })

        test('should ignore user supplied userId', async () => {
            const fakeList = await $mockList();
            const list = await $mockList();
            const { listData, userMock } = list;
            const { cookies } = await userMock.createCookie();

            const { body, statusCode } = await $mockHttp(tagsRouter).post({ label: 'new tag', userId: fakeList.userMock.userDir }, { cookies, query: { id: listData.id } });

            expect(body).toEqual({
                id: expect.any(String),
                label: 'new tag',
                userId: userMock.userData.id,
                listId: listData.id,
                description: null,
                groupName: null,
                badgeable: '',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })

            expect(statusCode).toBe(200)

            await list.delete()
        })

    })
})