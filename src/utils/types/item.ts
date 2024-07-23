import { TagData } from "./global";

export interface itemImageType {
    id: string
    image_path: string
    title?: string;
    description?: string;
    item_id: string
}

export interface ItemData {
    id: string;
    list_id: string;
    title: string;
    poster_path?: string
    cover_path?: string
    description?: string;
    fav?: boolean;
    trash?: boolean;
    tags: TagData['id'][]
    // progress_state?: itemProgressState;
    links?: Itemlink[]
    // content_fields?: itemField[]
    // main_fields?: main_fields[]
    // badges?: itemBadgesType[];
    related?: ItemData['id'][]
    // configurations: ItemConfiguration
    // extra_fields?: { name: string, value?: string }[]
}

export interface ItemMainFields {
    name: string;
    value: string | number;
    itemId?: string;
    bIsNumber?: boolean;

}

// interface ItemConfiguration {
//     layout?: "1" | "2" | "3" | "4";
// }


export interface Itemlink {
    url?: string;
    logo_path: string;
    label: string
}


export interface ItemBadgesType {
    logo_path: string;
    label: string;
}

// interface ItemField {
//     label: string;
//     body: string
// }

// export interface itemProgressState {
//     /**NextUI colors */
//     color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;
//     name: string
// }
