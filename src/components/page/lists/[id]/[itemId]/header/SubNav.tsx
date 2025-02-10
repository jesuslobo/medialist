import { useContext } from "react"
import { twJoin } from "tailwind-merge"
import { itemPageContext } from "../ItemPageProvider"
import ItemPageDeleteButton from "./DeleteButton"
import ItemPageEditButton from "./EditButton"
import ItemPageFavButton from "./FavButton"
import ItemPageLayoutTabs from "./LayoutTabs"

export default function ItemPageSubNav({ className }: { className?: string }) {
    const { item } = useContext(itemPageContext)
    const tabsNumber = item?.layout?.length || 0
    return (
        <div className={twJoin("flex items-center gap-x-2", className)}>
            {tabsNumber !== 0
                ? <ItemPageLayoutTabs variant="light" className="flex-grow" />
                : <div className="flex-grow"></div>
            }
            <div className="flex items-center gap-2">
                <ItemPageDeleteButton />
                <ItemPageEditButton />
                <ItemPageFavButton />
            </div>
        </div>
    )
}