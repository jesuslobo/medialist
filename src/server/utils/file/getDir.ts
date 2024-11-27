import { access, mkdir } from "fs/promises";
import { join } from "path";

export default async function $getDir(userId: string, listId: string, itemIdOrMakeListDir?: string | boolean, makeItemDir?: boolean) {
    const itemId = typeof itemIdOrMakeListDir === 'string' ? itemIdOrMakeListDir : null;
    const user = join('public', 'users', userId);

    const list = join(user, listId);
    const listThumbnails = join(list, 'thumbnails')

    const item = itemId ? join(list, itemId) : null;
    const itemThumbnails = item ? join(item, 'thumbnails') : null;

    const makeListDir = typeof itemIdOrMakeListDir === 'boolean' && itemIdOrMakeListDir;

    if (makeListDir) {
        const dirExists = await access(listThumbnails).then(() => true).catch(() => false)
        if (!dirExists)
            await mkdir(listThumbnails, { recursive: true });
    }

    if (makeItemDir && itemThumbnails) {
        const dirExists = await access(itemThumbnails).then(() => true).catch(() => false)
        if (!dirExists)
            await mkdir(itemThumbnails, { recursive: true });
    }

    return {
        user,
        list,
        listThumbnails,
        item,
        itemThumbnails,
    }
}