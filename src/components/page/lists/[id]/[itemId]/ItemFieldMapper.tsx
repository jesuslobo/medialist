import { ItemField } from "@/utils/types/item"
import ItemPageTagsField from "./fields/ItemPageTagsField"
import ItemPageTextField from "./fields/ItemPageTextField"
import ItemPageLabelTextField from "./fields/ItemPageLabelTextField"
import ItemPageLinkField from "./fields/ItemPageLinkField"

export default function ItemFieldMapper({
    field,
    ...position
    // children,
}: {
    field: ItemField
    rowIndex: number
    colIndex: number
    // children?: React.ReactNode
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
        default:
            return <></>
    }

}