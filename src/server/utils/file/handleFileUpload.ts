import { createWriteStream } from "fs";
import path from "path";
import internal from "stream";
import { pipeline } from "stream/promises";
import { thumbnailName, ThumbnailOptions } from "../../../utils/lib/fileHandling/thumbnailOptions";
import { generateID } from "../../../utils/lib/generateID";
import { $webpTransformer } from "../lib/webpTransformer";

interface Options {
    fileName?: string,
    pathDir?: string,
    prefix?: string,
    thumbnails?: ThumbnailOptions[],
    mimeTypes?: string[]
}

/** Uploading A Streamed File */
export default function $handleFileUpload(
    fileStream: internal.Readable & { truncated?: boolean; },
    pathDir: string,
    options?: Options,
) {
    try {
        // File Naming
        // remove file extension
        const fileExtension = options?.fileName ? path.extname(options?.fileName) : ''

        const generatedName = Date.now() + '_' + generateID()
        const fileName = (options?.prefix ? options.prefix + '_' : '') + generatedName + fileExtension

        const filePath = path.join(pathDir, fileName)

        const promises = []
        // File Writing
        const writeOriginalFile = createWriteStream(filePath)
        promises.push(pipeline(fileStream, writeOriginalFile))

        if (options?.thumbnails)
            options.thumbnails.forEach((option) => {
                const thumbnailPath = path.join(pathDir, thumbnailName(fileName, option))
                const thumbnailStream = createWriteStream(thumbnailPath)
                promises.push(pipeline(
                    fileStream,
                    $webpTransformer(option.w, option.h),
                    thumbnailStream
                ))
            })

        return [fileName, promises] as [string, Promise<void>[]]
    }
    catch (error) {
        console.log('[Image Uploading] Error: ', error)
        throw new Error('Error uploading an image')
    }
}