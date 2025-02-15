import { ItemField } from "@/utils/types/item"
import ItemPageCardField from "./fields/cards/ItemPageCardField"
import ItemPageLabelTextField from "./fields/ItemPageLabelTextField"
import ItemPageLinkField from "./fields/ItemPageLinkField"
import ItemPageRatingField from "./fields/ItemPageRatingField"
import ItemPageTagsField from "./fields/ItemPageTagsField"
import ItemPageTextField from "./fields/ItemPageTextField"
import ItemPageGallery from "./fields/media/ItemPageGallery"
import ItemPageImageField from "./fields/media/ItemPageImageField"

export default function ItemFieldMapper({
    field,
    ...position
}: {
    field: ItemField
    rowIndex: number
    colIndex: number
}) {
    switch (field.type) {
        case "tags":
            return <ItemPageTagsField />
        case "labelText":
            return <ItemPageLabelTextField field={field} {...position} />
        case "link":
            return <ItemPageLinkField field={field} />
        case "text":
            return <ItemPageTextField field={field} />
        case "rating":
            return <ItemPageRatingField field={field} />
        case "gallery":
            return <ItemPageGallery field={field} />
        case "image":
            return <ItemPageImageField field={field} />
        case "card":
            return <ItemPageCardField field={field} />
        default:
            return <></>
    }
}