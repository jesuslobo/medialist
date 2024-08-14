import ItemCard from "@/components/ui/cards/ItemCard";
import { useRouter } from "next/router";
import { useContext } from "react";
import { ListPageContext } from "./ListPageProvider";


export default function ListPageItems() {
    const { visibleItems, viewMode } = useContext(ListPageContext)
    const router = useRouter()

    return (
        <>
            {viewMode === "cards" &&
                <div className=" grid grid-cols-md-card gap-x-4 gap-y-4">
                    {visibleItems.map(item =>
                        <ItemCard
                            key={item.title}
                            item={item}
                            className="border-none duration-200 hover:scale-110 cubic-bezier shadow-lg group aspect-[2/3] animate-fade-in"
                        />
                    )}
                </div >
            }

        </>

    )
}