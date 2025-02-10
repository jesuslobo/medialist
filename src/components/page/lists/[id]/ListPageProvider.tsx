import useLocalStorage from "@/utils/hooks/useLocalStorage";
import { TagData } from "@/utils/types/global";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { Options, parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { createContext, Dispatch, SetStateAction, useMemo, useState } from "react";

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
    const [filterSettings, setFilterSettings] = useState<FilterSettings>({
        fav: false,
    })
    const [tagsQuery, setTagsQuery] = useQueryState('tags', parseAsArrayOf(parseAsString))

    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('viewMode-' + list.id, 'cards')
    const [showTags, setShowTags] = useState(false)

    const badgeableTags = useMemo(() => tags.filter(tag => tag.badgeable), [tags])
    const tagsQueryIds = tagsQuery?.map(label => tags.find(tag => tag.label === label)?.id) || []

    const visibleItems = useMemo(() => items.filter(isItemUnderFilter), [items, tagsQueryIds, filterSettings])

    function isItemUnderFilter(item: ItemData) {
        // if Flag is disabled || the rule if enabled
        const indexItemTags = new Map(item.tags.map(tagId => [tagId, true]))
        const tagsFlag = tagsQuery === null || tagsQueryIds.every(tagId => tagId && indexItemTags.has(tagId))
        const searchFlag = !filterSettings.search || item.title.toLowerCase().includes(filterSettings.search)
        const favFlag = !filterSettings.fav || item.fav
        // item.tags.some(tagId => tagsQueryIds.has(tagId)) for OR
        return tagsFlag && searchFlag && favFlag
    }

    const toggleTagQuery = (tag: TagData) => setTagsQuery(q =>
        q?.includes(tag.label)
            ? q?.length === 1 ? null : q?.filter(tagLabel => tagLabel !== tag.label) //remove
            : q?.concat(tag.label) || [tag.label] //add
    )

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
            toggleTagQuery,
            badgeableTags,
            visibleItems
        }}>
            {children}
        </ListPageContext.Provider>
    )
}

interface ListPageContext {
    list: ListData
    items: ItemData[],
    visibleItems: ItemData[],
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
    setFilterSettings: Dispatch<SetStateAction<FilterSettings>>,
    toggleTagQuery: (tag: TagData) => void,
    badgeableTags: TagData[],
}

interface FilterSettings {
    search?: string,
    fav?: boolean
}

type ViewMode = 'cards' | 'cardsList' | 'list';