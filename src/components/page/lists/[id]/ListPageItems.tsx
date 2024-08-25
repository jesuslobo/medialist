import ItemCard from "@/components/ui/cards/ItemCard";
import { ItemData } from "@/utils/types/item";
import { useContext } from "react";
import { ListPageContext } from "./ListPageProvider";


export default function ListPageItems() {
    const { items, viewMode, tagsQuery, filterSettings, tags } = useContext(ListPageContext)

    const tagsQueryIds = tagsQuery?.map(label => tags.find(tag => tag.label === label)?.id) || []

    const isItemUnderFilter = (item: ItemData) => {
        // item.tags.some(tagId => tagsQueryIds.includes(tagId)) for OR
        const tagsRule = tagsQuery === null || tagsQueryIds.every(tagId => tagId && item.tags.includes(tagId))
        const searchRule = !filterSettings.search || item.title.toLowerCase().includes(filterSettings.search)
        // const primeTagRule
        // const isFav
        return tagsRule && searchRule
    }

    switch (viewMode) {
        case 'list':
            return (
                <>
                </>
            )
        case 'cardsList':
            return (
                <>
                </>
            )
        default: //cards
            return (
                <div className=" grid grid-cols-md-card gap-x-4 gap-y-4">
                    {items.map(item => isItemUnderFilter(item) &&
                        <ItemCard
                            key={item.title + item.id}
                            item={item}
                            className="text-background border-none duration-200 hover:scale-110 cubic-bezier shadow-lg group aspect-2/3 animate-fade-in"
                        />
                    )}
                </div >
            )
    }
}