import { TagData, UserData } from "./global"
import { ListData } from "./list"

export interface ItemData {
    id: string
    userId: UserData['id']
    listId: ListData['id']
    title: string
    posterPath?: string
    coverPath?: string
    description?: string
    // fav?: boolean
    trash?: boolean
    tags: TagData['id'][]
    layout: ItemLayout
    // progress_state?: itemProgressState
    // content_fields?: itemField[]
    // badges?: itemBadgesType[]
    // related?: ItemData['id'][]
}

// Header Fields:
export interface ItemBadge extends LogoField { type: "badge" }

/** Layout Fields:
 *  [row] [column]  */
export type ItemLayout = ItemField[][]

export type ItemField = ItemLabelTextField | ItemLinkField | ItemTextField | ItemCardField | ItemTagsField
export type ItemFieldType = Extract<ItemField, { type: string }>['type'];

export interface ItemTagsField { type: "tags" }

export interface LogoField { label: string, logoPath?: string }

export interface ItemTextField { type: "text", variant: "long" | "short", text: string, }
export interface ItemLabelTextField { type: "labelText", label: string, body: string, countable?: boolean }
export interface ItemLinkField extends LogoField { type: "link", url: string }

export interface ItemCardField {
    type: "card",
    variant: "small",
    title: string,
    description: string,
    imagePath: string
}


// export interface ItemImageData {
//     id: string
//     image_path: string
//     title?: string
//     description?: string
//     item_id: string
// }


// export interface ItemBadgesType {
//     logo_path: string
//     label: string
// }

// export interface itemProgressState {
//     /**NextUI colors */
//     color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined
//     name: string
// }
