import { $createItems, $deleteItems } from "@/server/db/queries/items";
import { THUMBNAILS_OPTIONS, thumbnailName, ThumbnailOptions } from "@/utils/lib/fileHandling/thumbnailOptions";
import { generateID } from "@/utils/lib/generateID";
import { ItemData, ItemField, ItemLayoutHeader } from "@/utils/types/item";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import $mockList from "./mockList";
import $mockUser from "./mockUser";

type UserMock = Awaited<ReturnType<typeof $mockUser>>;
type ListMock = Awaited<ReturnType<typeof $mockList>>;

export type ItemFieldMock = ItemField & {
    /** if provided will generate a mock file */
    logo?: true
    logoPath?: string
}
export type layoutTabMock = [ItemLayoutHeader, ...ItemFieldMock[][]]

type Item = Partial<ItemData> & {
    poster?: boolean;
    cover?: boolean;
    layout?: layoutTabMock[]
}

export async function $mockItem(
    itemData: Item = {},
    listOrUserMock?: ListMock | UserMock,
) {
    const suppliedUserMock = listOrUserMock !== undefined;
    const { userMock, listMock } = await processParams(listOrUserMock);

    const id = generateID();
    const itemDir = join(listMock.listDir, id)

    mkdirSync(join(itemDir, 'thumbnails'), { recursive: true });

    itemData.coverPath = itemData.cover
        ? mockAFile(itemDir, THUMBNAILS_OPTIONS.ITEM_COVER)
        : itemData.coverPath
    itemData.posterPath = itemData.poster
        ? mockAFile(itemDir, THUMBNAILS_OPTIONS.ITEM_POSTER)
        : itemData.posterPath

    itemData?.layout?.forEach((tab) =>
        tab.forEach((column, colindex) => colindex !== 0 &&
            (column as ItemFieldMock[]).forEach((field) => {
                if (!field.logo) return
                field.logo = undefined
                field.logoPath = mockAFile(itemDir, THUMBNAILS_OPTIONS.LOGO)
            })
        )
    )

    const itemDb = await $createItems({
        id,
        title: 'mockItemTitle',
        userId: userMock.userData.id,
        listId: listMock.listData.id,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        ...itemData
    });

    const item = itemDb[0];

    async function deleteItem() {
        if (!suppliedUserMock)
            await listMock?.delete();
        else
            await $deleteItems(userMock.userData.id, [item.id]);
    }

    return {
        listMock,
        userMock,
        itemDir,
        itemData: {
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        },
        delete: async () => await deleteItem()
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

function mockAFile(dir: string, thumbs?: ThumbnailOptions[]) {
    const generatedName = Date.now() + '_' + generateID() + '.jpg'
    writeFileSync(join(dir, generatedName), Buffer.from(''));

    thumbs?.forEach((option) =>
        writeFileSync(join(dir, thumbnailName(generatedName, option)), Buffer.from(''))
    )
    return generatedName
}