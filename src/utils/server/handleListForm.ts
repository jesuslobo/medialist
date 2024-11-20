import busboy from "busboy";
import { access, mkdir } from "fs/promises";
import { join } from "path";
import internal from "stream";
import { coverThumbnailsOptions } from "../lib/fileHandling/thumbnailOptions";
import { ListData } from "../types/list";
import $handleFileUpload from "./fileHandling/handleFileUpload";

export interface HandleListFormData extends ListData { }

export default async function $handleListForm<T extends HandleListFormData = HandleListFormData>(userId: string, listId: string) {
    const listDir = join('public', 'users', userId, listId);
    const thumbnailsDir = join(listDir, 'thumbnails')

    const dirExists = await access(thumbnailsDir).then(() => true).catch(() => false)
    if (!dirExists) await mkdir(thumbnailsDir, { recursive: true });
    let data = {} as T

    return {
        handleFields: (name: string, value: string) => handleFields(name, value, data),
        handleFiles: (name: string, stream: internal.Readable & { truncated?: boolean }, info: busboy.FileInfo, disableStreamResume?: Boolean) =>
            handleFiles(name, stream, info, data, listDir, disableStreamResume),
        data,
        dir: {
            list: listDir,
            thumbnails: thumbnailsDir
        }
    }
}

function handleFields(name: string, value: string, data: HandleListFormData) {
    switch (name) {
        case "title": data.title = value; break
    }
}

function handleFiles(
    name: string,
    stream: internal.Readable & { truncated?: boolean },
    info: busboy.FileInfo,
    data: HandleListFormData,
    listDir: string,
    disableStreamResume?: Boolean
) {
    if (name === 'cover')
        data.coverPath = $handleFileUpload(stream, listDir, {
            thumbnails: coverThumbnailsOptions.listCover,
            fileName: info.filename
        })

    if (!disableStreamResume)
        stream.resume()
}
