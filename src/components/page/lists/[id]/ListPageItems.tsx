import ItemCard from "@/components/ui/cards/ItemCard";
import ItemCardsList from "@/components/ui/cards/ItemCardsList";
import { useContext } from "react";
import { ListPageContext } from "./ListPageProvider";

export default function ListPageItems() {
    const { viewMode, visibleItems, badgeableTags } = useContext(ListPageContext)

    switch (viewMode) {
        // case 'list':
        //     return (
        //         <>
        //         </>
        //     )
        case 'cardsList':
            return (
                <div className=" grid grid-cols-2 lg:grid-cols-1 gap-4">
                    {visibleItems.map(item =>
                        <ItemCardsList
                            key={item.title + item.id}
                            item={item}
                            tagsData={badgeableTags}
                        />
                    )}
                </div >
            )
        default: //cards
            return (
                <div className=" grid grid-cols-md-card gap-4">
                    {visibleItems.map(item =>
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