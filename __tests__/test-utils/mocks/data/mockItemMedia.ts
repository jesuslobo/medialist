import { $createItemMedia, $deleteItemMedia } from "@/server/db/queries/media";
import { thumbnailName, ThumbnailOptions, THUMBNAILS_OPTIONS } from "@/utils/lib/fileHandling/thumbnailOptions";
import { generateID } from "@/utils/lib/generateID";
import { MediaData } from "@/utils/types/media";
import { writeFileSync } from "fs";
import { join } from "path";
import { $mockItem } from "./mockItem";
import $mockUser from "./mockUser";

type UserMock = Awaited<ReturnType<typeof $mockUser>>;
type ItemMock = Awaited<ReturnType<typeof $mockItem>>;

export default async function $mockItemMedia(
    itemMediaData?: Partial<MediaData>,
    ItemOrUserMock?: ItemMock | UserMock,
) {
    const suppliedUserMock = ItemOrUserMock !== undefined;
    const { userMock, ItemMock } = await processParams(ItemOrUserMock);

    const mockPath = typeof itemMediaData?.path === 'string'
        ? itemMediaData.path
        : mockAFile(ItemMock.itemDir, THUMBNAILS_OPTIONS.ITEM_MEDIA);

    const itemMediaDb = await $createItemMedia({
        id: generateID(),
        userId: userMock.userData.id,
        itemId: ItemMock.itemData.id,
        title: 'mockItemMedia',
        type: 'image',
        path: mockPath,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        ...itemMediaData
    });

    const mediaData = itemMediaDb[0];

    async function deleteItemMedia() {
        if (!suppliedUserMock)
            await ItemMock?.delete();
        else
            await $deleteItemMedia(userMock.userData.id, mediaData.id);
    }

    return {
        ItemMock,
        userMock,
        mediaData: {
            ...mediaData,
            createdAt: mediaData.createdAt.toISOString(),
            updatedAt: mediaData.updatedAt.toISOString()
        },
        delete: async () => await deleteItemMedia()
    };

};

async function processParams(
    ItemOrUserMock?: ItemMock | UserMock,
) {
    if (!ItemOrUserMock) {
        const ItemMock = await $mockItem()
        const userMock = ItemMock.userMock;
        return { userMock, ItemMock }
    }

    if ('itemData' in ItemOrUserMock)
        return { userMock: ItemOrUserMock.userMock, ItemMock: ItemOrUserMock }

    const userMock = ItemOrUserMock;
    const ItemMock = await $mockItem(undefined, userMock);
    return { userMock, ItemMock }
}

function mockAFile(dir: string, thumbs?: ThumbnailOptions[]) {
    const generatedName = Date.now() + '_' + generateID() + '.jpg'
    writeFileSync(join(dir, generatedName), Buffer.from(''));

    thumbs?.forEach((option) =>
        writeFileSync(join(dir, thumbnailName(generatedName, option)), Buffer.from(''))
    )
    return generatedName
}