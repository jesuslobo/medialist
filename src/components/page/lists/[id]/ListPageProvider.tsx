import useLocalStorage from "@/utils/hooks/useLocalStorage";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { createContext, useState } from "react";

interface ListPageContext {
    list: ListData
    allItems: ItemData[]
    visibleItems: ItemData[]
    viewMode: ViewMode
}

type ViewMode = 'cards' | 'listCards' | 'list';

export const ListPageContext = createContext({} as ListPageContext)

export default function ListPageProvider({
    children,
    list,
    items
}: {
    children: React.ReactNode,
    list: ListData,
    items: ItemData[]
}) {
    const [visibleItems, setVisibleItems] = useState<ItemData[]>(items)
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('viewMode-' + list.id, 'cards')

    return (
        <ListPageContext.Provider value={{
            list,
            allItems: items,
            visibleItems,
            viewMode
        }}>
            {children}
        </ListPageContext.Provider>
    )
}