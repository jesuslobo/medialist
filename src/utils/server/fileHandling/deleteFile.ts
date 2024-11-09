import { unlink } from "fs/promises";
import { join } from "path";

export default async function $deleteFile(...paths: string[]) {
    if (!paths) return;
    try {
        const filePath = join(...paths);
        await unlink(filePath);
    } catch (error) {
        console.log(`[Error] deleteFile: failed to delete ${paths.join('/')} \n`, error);
    }
}