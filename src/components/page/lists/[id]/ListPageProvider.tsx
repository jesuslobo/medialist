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
    const [filterSettings, setFilterSettings] = useState<FilterSettings>({})
    const [tagsQuery, setTagsQuery] = useQueryState('tags', parseAsArrayOf(parseAsString))

    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('viewMode-' + list.id, 'cards')
    const [showTags, setShowTags] = useState(false)

    return (
        <ListPageContext.Provider value={{
            list,
            items,
            viewMode,
            tags,
            setViewMode,
            showTags,
            setShowTags,
            tagsQuery,
            setTagsQuery,
            filterSettings,
            setFilterSettings,
        }}>
            {children}
        </ListPageContext.Provider>
    )
}

interface ListPageContext {
    list: ListData
    items: ItemData[],
    tags: TagData[]
    viewMode: ViewMode
    setViewMode: Dispatch<SetStateAction<ViewMode>>
    showTags: boolean
    setShowTags: Dispatch<SetStateAction<boolean>>
    setTagsQuery: <Shallow>(value: string[]
        | ((old: string[] | null) => string[] | null)
        | null, options?: Options<Shallow> |
            undefined) => Promise<URLSearchParams>
    tagsQuery: string[] | null,
    filterSettings: FilterSettings
    setFilterSettings: Dispatch<SetStateAction<FilterSettings>>
}

interface FilterSettings {
    search?: string
}

type ViewMode = 'cards' | 'cardsList' | 'list';