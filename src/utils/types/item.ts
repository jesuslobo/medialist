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

export type ItemField = ItemLabelTextField | ItemLinkField
export type ItemFieldType = "labelText" | "link" | "text"

export interface LogoField { label: string, logoPath?: string | File | null }

export interface ItemTextField { type: "text", label: string, }
export interface ItemLabelTextField { type: "labelText", label: string, body: string, countable?: boolean }
export interface ItemLinkField extends LogoField { type: "link", url: string }



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
