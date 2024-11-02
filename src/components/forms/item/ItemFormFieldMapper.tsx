import { ItemFieldType } from "@/utils/types/item"
import ItemFormLabelTextField from "./fields/ItemFormLabelTextField"
import ItemFormLinkField from "./fields/ItemFormLinkField"
import ItemFormTextField from "./fields/ItemFormTextField"
import ItemFormTagsField from "./fields/tags/ItemFormTagsField"

// Maps a Field to its Component equivalent
export default function ItemFormFieldsMapper({
    type,
    ...position
    // children,
}: {
    type: ItemFieldType
    rowIndex: number
    colIndex: number
    // children?: React.ReactNode
}) {

    switch (type) {
        case "tags":
            return <ItemFormTagsField />
        case "labelText":
            return <ItemFormLabelTextField {...position} />
        case "link":
            return <ItemFormLinkField {...position} />
        case "text":
            return <ItemFormTextField  {...position} />
        default:
            return <></>
    }

}