import { generateID } from "../../../../utils/lib/generateID";
import { TagData } from "../../../../utils/types/global";
import { ItemData, ItemField, ItemLayoutTab, LogoField } from "../../../../utils/types/item";
import { $itemFormOptions } from "./formData.options";
import $getDir from "../../file/getDir";
import $processFormData, { ProcessedFormData } from "../processFormData";

type ItemServerForm = ItemData & ProcessedFormData & {
    rawTags: string[]
}

/** Any Extra logic should be in BB's onFinish */
export default async function $processItemForm(userId: string, listId: string, itemId: string) {
    const dir = await $getDir(userId, listId, itemId, true);
    const itemDir = dir.item as string;

    const form = await $processFormData<ItemServerForm>($itemFormOptions(itemDir))
    const { data, attachments } = form

    return {
        ...form,
        /** Directly assemble the addresses of new logos to their fields */
        mapLayoutsToLogos: () => mapFieldsToLogos(data, attachments),
        /** Returns an Array of New Tags */
        handleTags: (tagsData: { id: string }[]) => handleTags(tagsData, data, userId, listId),
        dir: {
            item: itemDir,
            thumbnails: dir.itemThumbnails as string,
        },
    }
};

function mapFieldsToLogos(data: ItemServerForm, logoPaths: Map<String, string>) {
    return data.layout?.map(tab =>
        tab.map((row, rowIndex) =>
            rowIndex === 0
                ? row // header
                : (row as ItemField[]).map(field => {
                    if ((field as LogoField)?.logoPath) {
                        const fieldT = field as LogoField;
                        const id = `logoPaths[${fieldT.logoPath}]`
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

function handleTags(tagsData: { id: string }[], data: ItemServerForm, userId: string, listId: string) {
    let newTags = [] as string[]
    let requestTags = data.tags ? [...data.tags] : []
    data.tags = []

    requestTags.forEach(tag => {
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
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now())
            }
            data.tags.push(tagData.id)
            return tagData
        })
    }

    return newTagsData
}