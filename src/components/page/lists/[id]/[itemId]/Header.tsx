import { useContext } from "react"
import { itemPageContext } from "./ItemPageProvider"
import ItemPagePosterBeside from "./layouts/PosterBeside"
import ItemPagePosterInside from "./layouts/PosterInside"
import { ItemData } from "@/utils/types/item"

export default function ItemPageHeader() {
    const { item } = useContext(itemPageContext)
    const headerType = item?.header?.type as ItemData['header']['type']

    switch (headerType) {
        case "poster_inside":
            return <ItemPagePosterInside />
        case "poster_beside":
        default:
            return <ItemPagePosterBeside />
    }
}