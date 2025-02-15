import { ItemFieldType } from "@/utils/types/item"
import ItemFormCardField from "./fields/cards/ItemFormCardField"
import ItemFormLabelTextField from "./fields/ItemFormLabelTextField"
import ItemFormLinkField from "./fields/ItemFormLinkField"
import ItemFormRatingField from "./fields/ItemFormRatingField"
import ItemFormTextField from "./fields/ItemFormTextField"
import ItemFormGallery from "./fields/media/ItemFormGallery"
import ItemFormImageField from "./fields/media/ItemFormImageField"
import ItemFormTagsField from "./fields/tags/ItemFormTagsField"

// Maps a Field to its Component equivalent
export default function ItemFormFieldsMapper({
    type,
    ...position
}: {
    type: ItemFieldType
    rowIndex: number
    colIndex: number
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
        case "rating":
            return <ItemFormRatingField {...position} />
        case "gallery":
            return <ItemFormGallery {...position} />
        case "image":
            return <ItemFormImageField {...position} />
        case "card":
            return <ItemFormCardField {...position} />
        default:
            return <></>
    }
}