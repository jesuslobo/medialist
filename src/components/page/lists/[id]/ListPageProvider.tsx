import useLocalStorage from "@/utils/hooks/useLocalStorage";
import { TagData } from "@/utils/types/global";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { Options, parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { createContext, Dispatch, SetStateAction, useState } from "react";

export const ListPageContext = createContext({} as ListPageContext)

export default function ListPageProvider({
    children,
    list,
    items,
    tags
}: {
    children: React.ReactNode,
    list: ListData,
    items: ItemData[],
    tags: TagData[]
}) {
    const [tagsQuery, setTagsQuery] = useQueryState('tags', parseAsArrayOf(parseAsString))

    const [visibleItems, setVisibleItems] = useState<ItemData[]>(items)
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('viewMode-' + list.id, 'cards')
    const [showTags, setShowTags] = useState(false)

    return (
        <ListPageContext.Provider value={{
            list,
            allItems: items,
            visibleItems,
            viewMode,
            setViewMode,
            showTags,
            setShowTags,
            tagsQuery,
            setTagsQuery,
        }}>
            {children}
        </ListPageContext.Provider>
    )
}

interface ListPageContext {
    list: ListData
    allItems: ItemData[]
    visibleItems: ItemData[]
    viewMode: ViewMode
    setViewMode: Dispatch<SetStateAction<ViewMode>>
    showTags: boolean
    setShowTags: Dispatch<SetStateAction<boolean>>
    setTagsQuery: <Shallow>(value: string[]
        | ((old: string[] | null) => string[] | null)
        | null, options?: Options<Shallow> |
            undefined) => Promise<URLSearchParams>
    tagsQuery: string[] | null
}

type ViewMode = 'cards' | 'cardsList' | 'list';