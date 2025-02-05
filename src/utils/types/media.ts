import { UserData } from "./global"
import { ItemData } from "./item"

export interface MediaData {
    id: string
    userId: UserData['id']
    itemId: ItemData['id']
    title: string
    path: string
    type: "image"
    createdAt: Date
    updatedAt: Date
}