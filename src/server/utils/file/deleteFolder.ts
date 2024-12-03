import { rmdir } from "fs/promises";
import { join } from "path";


export default async function $deleteFolder(...paths: string[]) {
    if (!paths) return;
    try {
        const path = join(...paths);
        await rmdir(path, { recursive: true });
    } catch (error) {
        console.log(`[Error] deleteFolder: failed to delete ${paths.join('/')} \n`, error);
    }
}