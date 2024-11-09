import busboy from "busboy";
import { access, mkdir } from "fs/promises";
import { join } from "path";
import internal from "stream";
import handleFileUpload from "../lib/fileHandling/handleFileUpload";
import { coverThumbnailsOptions } from "../lib/fileHandling/thumbnailOptions";
import { generateID } from "../lib/generateID";
import { TagData } from "../types/global";
import { ItemData, ItemField, ItemLayoutTab, LogoField } from "../types/item";

export interface HandleItemFormData extends ItemData {
    rawTags: string[]
}

/** Any Extra logic should be in BB's onFinish */
export default async function $handleItemForm<T extends HandleItemFormData = HandleItemFormData>(userId: string, listId: string, itemId: string) {
    let logoPaths = new Map<String, LogoField['logoPath']>()

    const itemDir = join('public', 'users', userId, listId, itemId);
    const thumbnailsDir = join(itemDir, 'thumbnails')

    const dirExists = await access(thumbnailsDir).then(() => true).catch(() => false)
    if (!dirExists) await mkdir(thumbnailsDir, { recursive: true });

    let data = {
        tags: [] as string[],
    } as T;

    return {
        /** BusBoy onFields */
        handleFields: (name: string, value: string) => handleFields(name, value, data),
        /** BusBoy onFiles */
        handleFiles: (name: string, stream: internal.Readable & { truncated?: boolean }, info: busboy.FileInfo, disableStreamResume?: Boolean) =>
            handleFiles(name, stream, info, data, logoPaths, itemDir, disableStreamResume),
        /** Directly assemble the addresses of new logos to their fields */
        mapLayoutsToLogos: () => mapFieldsToLogos(data, logoPaths),
        /** Returns an Array of New Tags */
        handleTags: (tagsData: { id: string }[]) => handleTags(tagsData, data, userId, listId),
        data,
        dir: {
            item: itemDir,
            thumbnails: thumbnailsDir
        },
    }
};

function handleFields(name: string, value: string, data: HandleItemFormData) {
    switch (name) {
        case 'title': data.title = value; break
        case 'description': data.description = value; break
        case 'header': data.header = JSON.parse(value); break
        case 'tags': data.rawTags = JSON.parse(value); break
        case 'layout': {
            const layout = JSON.parse(value) as ItemLayoutTab[];
            data.layout = layout
            break
        }
    }
}

function handleFiles(
    name: string,
    stream: internal.Readable & { truncated?: boolean },
    info: busboy.FileInfo,
    data: HandleItemFormData,
    logoPaths: Map<String, LogoField['logoPath']>,
    itemDir: string,
    disableStreamResume?: Boolean
) {
    if (name.includes('logoFields')) {
        const id = name
        const logoPath = handleFileUpload(stream, itemDir, {
            thumbnails: coverThumbnailsOptions.logo,
            fileName: info.filename
        })
        logoPaths.set(id, logoPath)
    }

    if (name === 'poster')
        data.posterPath = handleFileUpload(stream, itemDir, {
            thumbnails: coverThumbnailsOptions.itemPoster,
            fileName: info.filename
        })

    if (name === 'cover')
        data.coverPath = handleFileUpload(stream, itemDir, {
            thumbnails: coverThumbnailsOptions.itemCover,
            fileName: info.filename
        })

    if (!disableStreamResume)
        stream.resume()
}

function mapFieldsToLogos(data: HandleItemFormData, logoPaths: Map<String, LogoField['logoPath']>) {
    return data.layout?.map(tab =>
        tab.map((row, rowIndex) =>
            rowIndex === 0
                ? row // header
                : (row as ItemField[]).map(field => {
                    if ((field as LogoField)?.logoPath) {
                        const fieldT = field as LogoField;
                        const id = `logoFields[${fieldT.logoPath}]`
                        let logoPath = fieldT?.logoPath;
                        if (logoPaths.get(id)) logoPath = logoPaths.get(id)
                        return { ...field, logoPath, id: undefined }
                    } else {
                        return { ...field, id: undefined }
                    }
                })
        )
    ) as ItemLayoutTab[] || []
}

function handleTags(tagsData: { id: string }[], data: HandleItemFormData, userId: string, listId: string) {
    let newTags = [] as string[]

    data.rawTags.forEach(tag => {
        // tag could be a new tag name or an existing tag id
        // if A user can type a tag of 10 letters that can escape validation
        if (tag.length !== 10) {
            newTags.push(tag) // no need to check if it exists
        } else if (tagsData.some(t => t.id === tag)) {
            data.tags.push(tag)
        } else {
            newTags.push(tag)
        }
    })

    let newTagsData = [] as TagData[]
    if (newTags.length) {
        newTagsData = newTags.map(label => {
            let tagData = {
                id: generateID(),
                userId,
                listId,
                label,
            }
            data.tags.push(tagData.id)
            return tagData
        })
    }

    return newTagsData
}