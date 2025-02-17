import { generateID } from "@/utils/lib/generateID";
import { TagData } from "@/utils/types/global";
import { ItemData, ItemField, ItemImageField, ItemLayoutTab, LogoField } from "@/utils/types/item";
import { MediaData } from "@/utils/types/media";
import $getDir from "../../file/getDir";
import $processFormData, { ProcessedFormData } from "../processFormData";
import { $ITEM_FORM_SCHEMA } from "./fromSchema";

type ItemServerForm = ItemData & ProcessedFormData & {
    media?: Pick<MediaData, 'path' | 'title' | 'keywords'>[]
}

/** Any Extra logic should be in BB's onFinish */
export default async function $processItemForm(userId: string, listId: string, itemId: string) {
    const dir = await $getDir(userId, listId, itemId, true);
    const itemDir = dir.item as string;

    const form = $processFormData<ItemServerForm>($ITEM_FORM_SCHEMA(itemDir))
    const { data, attachments, promises } = form

    return {
        ...form,
        /** Directly assemble the addresses of new logos to their fields, SHOULD be used after handleMediaImages() */
        mapLayoutsToPaths: () => mapFieldsToPaths(data, attachments),
        handleMediaImages: () => handleMediaImages(data, attachments, userId, itemId),
        /** Returns an Array of New Tags */
        handleTags: (tagsData: { id: string }[]) => handleTags(tagsData, data, userId, listId),
        dir: {
            item: itemDir,
            thumbnails: dir.itemThumbnails as string,
        },
        promises,
    }
};

// map fileds to paths
function mapFieldsToPaths(data: ItemServerForm, logoPaths: Map<String, string>) {
    return data.layout?.map(tab =>
        tab.map((row, rowIndex) =>
            rowIndex === 0
                ? row // header
                : (row as ItemField[]).map(field => {
                    if ((field as LogoField)?.logoPath) {
                        const fieldT = field as LogoField;
                        const pathKey = `logoPaths[${fieldT.logoPath}]`
                        let logoPath = fieldT?.logoPath;
                        if (logoPaths.get(pathKey)) logoPath = logoPaths.get(pathKey)
                        return { ...field, logoPath, id: undefined }
                    } else if ((field as ItemImageField)?.imageId) {
                        const fieldT = field as ItemImageField;
                        const imageIdKey = `mediaImages[${fieldT.imageId}]`
                        let imageId = fieldT?.imageId;
                        if (logoPaths.get(imageIdKey))
                            imageId = logoPaths.get(imageIdKey) as string
                        return { ...field, imageId, id: undefined }
                    }
                    else {
                        return { ...field, id: undefined }
                    }
                })
        )
    ) as ItemLayoutTab[] || []
}

function handleMediaImages(data: ItemServerForm, mediaImages: Map<String, string>, userId: string, itemId: string) {
    let images = [] as MediaData[]

    data.media?.forEach(media => {
        const key = `mediaImages[${media.path}]`
        if (!mediaImages.has(key)) return

        const path = mediaImages.get(key) as string
        const id = generateID()
        // we store id of the image, so we can use it in the layout with images-related fileds
        mediaImages.set(key, id)

        images.push({
            id,
            userId,
            itemId,
            path,
            keywords: Array.isArray(media.keywords) ? media.keywords : [],
            type: 'image',
            title: media.title || null,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
        })
    })

    return images
}

function handleTags(tagsIDs: { id: string }[], data: ItemServerForm, userId: string, listId: string) {
    let newTags = [] as string[]
    let requestTags = data.tags ? [...data.tags] : []
    data.tags = []

    requestTags.forEach(tag => {
        // tag could be a new tag name or an existing tag id
        // if A user can type a tag of 10 letters that can escape validation
        if (tag.length !== 10) {
            newTags.push(tag) // no need to check if it exists
        } else if (tagsIDs.some(t => t.id === tag)) {
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
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now())
            }
            data.tags.push(tagData.id)
            return tagData
        })
    }

    return newTagsData
}