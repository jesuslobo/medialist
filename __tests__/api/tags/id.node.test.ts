import tagsRouter from '@/pages/api/tags/[id]';
import { $generateLongID } from '@/server/utils/lib/generateID';
import { ApiErrorCode } from '@/utils/types/serverResponse';
import $mockTag from '@tests/test-utils/mocks/data/mockTag';
import $mockHttp from '@tests/test-utils/mocks/mockHttp';
import { describe, expect, test, vi } from 'vitest';

vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('@/server/db');

describe('api/tags/[id]', async () => {

    describe('should return 404', () => {
        test('if a fake/unexisting tag ID is provided', async () => {
            const { userMock } = await $mockTag({ label: 'tag' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: $generateLongID() } });
            expect(body).toEqual({ errorCode: ApiErrorCode.NOT_FOUND });
            expect(statusCode).toBe(404);

            await user.delete();
        })

        test('if an ID of other user\'s tag is provided', async () => {
            const { userMock } = await $mockTag({ label: 'tag1' });
            const { tagData: otherUserTag } = await $mockTag({ label: 'tag' });
            const { userData, ...user } = userMock;
            const { cookies } = await user.createCookie();

            const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: otherUserTag.id } });
            expect(body).toEqual({ errorCode: ApiErrorCode.NOT_FOUND })
            expect(statusCode).toBe(404);

            await user.delete();
        })
    })

    test('should return 400 Bad Request if an invalid ID is provided', async () => {
        const { userMock } = await $mockTag({ label: 'tag' });
        const { userData, ...user } = userMock;
        const { cookies } = await user.createCookie();

        const r1 = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: 'invalidID' } });
        expect(r1.body).toEqual({ errorCode: ApiErrorCode.BAD_REQUEST });
        expect(r1.statusCode).toBe(400);

        const r2 = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: '' } });
        expect(r2.body).toEqual({ errorCode: ApiErrorCode.BAD_REQUEST });
        expect(r2.statusCode).toBe(400);

        //to-add:
        // const fakeString = 'a'.repeat(10 ** 10);
        // const r3 = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: fakeString } });
        // expect(r3.body).toEqual({ errorCode: ApiErrorCode.BAD_REQUEST });
        // expect(r3.statusCode).toBe(400);

        await user.delete();
    })

    describe('GET - get a tag by id', () => {
        test('should return a tag data when its ID is provided', async () => {
            const tag = await $mockTag();
            const { tagData, userMock } = tag;
            const { cookies } = await userMock.createCookie();
            const { body, statusCode } = await $mockHttp(tagsRouter).get(undefined, { cookies, query: { id: tagData.id } });

            expect(body).toEqual({
                ...tagData, createdAt: tagData.createdAt.toISOString(), updatedAt: tagData.updatedAt.toISOString()
            })
            expect(statusCode).toBe(200)

            await tag.delete()
        })

    })

    describe('PATCH - update a tag by id', () => {
        test('should change tag data', async () => {
            const tag = await $mockTag({
                createdAt: new Date(2000,1),
                updatedAt: new Date(2000,1)
            });
            const { tagData, userMock } = tag;
            const { cookies } = await userMock.createCookie();
            const { body, statusCode } = await $mockHttp(tagsRouter).patch({ label: 'newLabel' }, { cookies, query: { id: tagData.id } });

            expect(body).toEqual({
                ...tagData,
                label: 'newLabel',
                createdAt: tagData.createdAt.toISOString(),
                updatedAt: expect.not.stringMatching(tagData.updatedAt.toISOString())
            })
            expect(statusCode).toBe(200)

            await tag.delete()

        })
    })

    describe('DELETE - delete a tag by id', () => {
        test('should delete a tag', async () => {
            const tag = await $mockTag();
            const { tagData, userMock } = tag;
            const { cookies } = await userMock.createCookie();
            const { body, statusCode } = await $mockHttp(tagsRouter).delete(undefined, { cookies, query: { id: tagData.id } });

            expect(body).toEqual({
                ...tagData, createdAt: tagData.createdAt.toISOString(), updatedAt: tagData.updatedAt.toISOString()
            })
            expect(statusCode).toBe(200)

            await userMock.delete()
        })
    })
})