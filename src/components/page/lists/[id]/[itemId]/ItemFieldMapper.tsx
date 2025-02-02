import { ItemField } from "@/utils/types/item"
import ItemPageLabelTextField from "./fields/ItemPageLabelTextField"
import ItemPageLinkField from "./fields/ItemPageLinkField"
import ItemPageRatingField from "./fields/ItemPageRatingField"
import ItemPageTagsField from "./fields/ItemPageTagsField"
import ItemPageTextField from "./fields/ItemPageTextField"

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
            return <ItemPageLabelTextField field={field} />
        case "link":
            return <ItemPageLinkField field={field} />
        case "text":
            return <ItemPageTextField field={field} />
        case "rating":
            return <ItemPageRatingField field={field} />
        default:
            return <></>
    }

}