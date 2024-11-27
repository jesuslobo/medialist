import { createWriteStream } from "fs";
import path from "path";
import internal from "stream";
import { generateID } from "../../../utils/lib/generateID";
import { thumbnailName, ThumbnailOptions } from "../../../utils/lib/fileHandling/thumbnailOptions";
import { $webpTransformer } from "../lib/webpTransformer";

interface Options {
    fileName?: string,
    pathDir?: string,
    prefix?: string,
    thumbnails?: ThumbnailOptions[],
    allowedTypes?: string[] // Not implemented yet
}

type fileName = string

/** Maybe add support for plugins?  such as support for S3 transformer*/
/** Uploading A Streamed File */
export default function $handleFileUpload(
    fileStream: internal.Readable & { truncated?: boolean; },
    pathDir: string,
    options?: Options,
) {
    try {
        // File Naming
        const fileExtension = options?.fileName ? path.extname(options?.fileName) : ''

        const generatedName = Date.now() + '_' + generateID()
        const fileName = (options?.prefix ? options.prefix + '_' : '') + generatedName + fileExtension

        const filePath = path.join(pathDir, fileName)

        // File Writing
        const writeOriginalFile = createWriteStream(filePath)
        fileStream.pipe(writeOriginalFile) // Write the original file

        if (options?.thumbnails)
            options.thumbnails.forEach((option) => {
                const thumbnailPath = path.join(pathDir, thumbnailName(fileName, option))
                const thumbnailStream = createWriteStream(thumbnailPath)
                fileStream.pipe($webpTransformer(option.w, option.h)).pipe(thumbnailStream)
            })

        return fileName as fileName
    }
    catch (error) {
        console.log('[Image Uploading] Error: ', error)
        throw new Error('Error uploading an image')
    }

}