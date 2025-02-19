import { $createLists, $deleteLists } from "@/server/db/queries/lists";
import { $generateID, $generateShortID } from "@/server/utils/lib/generateID";
import { THUMBNAILS_OPTIONS, thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ListData } from "@/utils/types/list";
import { mkdirSync } from "fs";
import { fs } from "memfs";
import { join } from "path";
import $mockUser from "./mockUser";

type List = Partial<ListData> & {
    /* will create a empty files with thumbnail-like names, since we Only care about the the file existence*/
    cover?: boolean;
}

export default async function $mockList(listData?: List, userMock?: Awaited<ReturnType<typeof $mockUser>>) {
    let suppliedUserMock = userMock !== undefined;
    if (!userMock) userMock = await $mockUser();

    const userId = userMock.userData.id

    const id = $generateShortID();
    const listDir = join(userMock.userDir, id);

    mkdirSync(join(listDir, 'thumbnails'), { recursive: true });

    let coverPath = listData?.coverPath;
    if (listData?.cover) {
        const generatedName = Date.now() + '_' + $generateID(15) + '.jpg'
        fs.writeFileSync(join(listDir, generatedName), Buffer.from(''));
        coverPath = generatedName

        THUMBNAILS_OPTIONS.LIST_COVER.forEach((option) =>
            fs.writeFileSync(join(listDir, thumbnailName(generatedName, option)), Buffer.from(''))
        )
    }

    const list = await $createLists({
        id,
        userId,
        title: 'Test List',
        coverPath,
        trash: false,
        configs: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...listData
    })


    async function deleteList() {
        if (!suppliedUserMock)
            await userMock?.delete();
        else
            await $deleteLists(userId, [list[0].id]);
    }

    return {
        listData: list[0],
        listDir,
        userMock,
        delete: deleteList,
    }
};