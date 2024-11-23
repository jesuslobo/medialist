import { thumbnailName, ThumbnailOptions } from "@/utils/lib/fileHandling/thumbnailOptions";
import { unlink } from "fs/promises";
import { join } from "path";

/**
 * Deletes a file from the server
 * @param thumbnailOptionsOrPath - ThumbnailOptions[] or path to the file, if ThumbnailOptions[] is provided, it will delete the file and all its thumbnails
 */
export default async function $deleteFile(thumbnailOptionsOrPath: string | ThumbnailOptions[], ...paths: string[]) {
    if (!paths) return;
    try {
        if (Array.isArray(thumbnailOptionsOrPath))
            await $clearThumbnails(thumbnailOptionsOrPath, ...paths)

        const filePath = typeof thumbnailOptionsOrPath === 'string' ? join(thumbnailOptionsOrPath, ...paths) : join(...paths)
        await unlink(filePath);
    } catch (error) {
        console.log(`[Error] deleteFile: failed to delete ${paths.join('\\')} \n`, error);
    }
}

export async function $clearThumbnails(thumbnailOptions: ThumbnailOptions[], ...paths: string[]) {
    if (!paths) return;
    if (paths.length < 2) return new Error('Invalid path, must have at least 2 paths, with the last one being the file name');

    try {
        const fileName = paths.pop() as string
        const fileDir = join(...paths)
        const promises = thumbnailOptions.map(option => {
            const dir = join(fileDir, thumbnailName(fileName, option))
            return unlink(dir)
        })

        await Promise.all(promises)
    } catch (error) {
        console.log(`[Error] deleteThumbnail: failed to delete ${paths.join('\\')} \n`, error);
    }
}
