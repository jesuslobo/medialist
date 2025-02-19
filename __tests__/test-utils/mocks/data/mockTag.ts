import { $createTags, $deleteTags } from "@/server/db/queries/tags";
import { $generateLongID } from "@/server/utils/lib/generateID";
import { TagData } from "@/utils/types/global";
import $mockList from "./mockList";
import $mockUser from "./mockUser";

type UserMock = Awaited<ReturnType<typeof $mockUser>>;
type ListMock = Awaited<ReturnType<typeof $mockList>>;

export default async function $mockTag(
    tagData?: Partial<TagData>,
    listOrUserMock?: ListMock | UserMock,
) {
    const suppliedUserMock = listOrUserMock !== undefined;
    const { userMock, listMock } = await processParams(listOrUserMock);

    const tagDb = await $createTags({
        id: $generateLongID(),
        label: 'mockTagLabel',
        userId: userMock.userData.id,
        listId: listMock.listData.id,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        ...tagData
    });

    const tag = tagDb[0];

    async function deleteTag() {
        if (!suppliedUserMock)
            await listMock?.delete();
        else
            await $deleteTags(userMock.userData.id, tag.id);
    }

    return {
        listMock,
        userMock,
        tagData: tag,
        delete: async () => await deleteTag()
    };

};

async function processParams(
    listOrUserMock?: ListMock | UserMock,
) {
    if (!listOrUserMock) {
        const listMock = await $mockList()
        const userMock = listMock.userMock;
        return { userMock, listMock }
    }

    if ('listData' in listOrUserMock)
        return { userMock: listOrUserMock.userMock, listMock: listOrUserMock }

    const userMock = listOrUserMock;
    const listMock = await $mockList(undefined, userMock);
    return { userMock, listMock }
}