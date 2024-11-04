import { SortableItemType } from "@/components/ui/layout/drag&drop/logic/SortableMultiContainersWrapper";
import { TagData } from "@/utils/types/global";
import { ItemData, ItemField, ItemLayoutHeader } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { createContext, Dispatch, SetStateAction, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props extends Omit<ItemFormContext, "setActiveTabFields" | "setActiveTabHeader" | "activeTabFields" | "activeTabHeader"> {
    children: React.ReactNode,
    layoutTabs: ItemFormLayoutTab[]
    setLayoutTabs: Dispatch<SetStateAction<ItemFormLayoutTab[]>>
    activeTabIndex: number
}

interface ItemFormContext {
    tags: TagData[],
    list: ListData,
    item?: ItemData,
    itemForm: UseFormReturn<ItemFormData>,
    activeTabFields: ItemFormField[][],
    setActiveTabFields: Dispatch<SetStateAction<ItemFormField[][]>>,
    activeTabHeader: ItemLayoutHeader,
    setActiveTabHeader: Dispatch<SetStateAction<ItemLayoutHeader>>,
}

export type ItemFormField = SortableItemType & ItemField
export type ItemFormLayoutTab = [ItemLayoutHeader, ...ItemFormField[][]]
export type ItemFormLogoField = ItemFormField & { id: number, logoPath: File | null }

export interface ItemFormData extends Omit<ItemData, "id" | "createdAt" | "updatedAt" | 'coverPath' | 'posterPath' | 'userId'> {
    cover: File | null | string
    poster: File | null | string
}

export const ItemFormContext = createContext({} as ItemFormContext);

export default function ItemFormProvider({
    tags,
    list,
    item,
    itemForm,
    layoutTabs,
    setLayoutTabs,
    activeTabIndex,
    children,
}: Props) {
    // a facade for the activeLayoutTab
    const [activeTabHeader, ...activeTabFields] = layoutTabs?.[activeTabIndex] || []

    type setActiveTabHeaderCallBack = ((prev: ItemLayoutHeader) => ItemLayoutHeader)
    function setActiveTabHeader(value: ItemLayoutHeader | setActiveTabHeaderCallBack) {
        if (!layoutTabs?.[activeTabIndex]?.[0]) return

        setLayoutTabs(prev => {
            let newTabs = [...prev]
            const prevHeader = prev[activeTabIndex]?.[0] as ItemLayoutHeader
            const fields = prev[activeTabIndex]?.slice(1) as ItemFormField[][]
            const newHeader = typeof value === 'function'
                ? value(prevHeader)
                : value

            newTabs[activeTabIndex] = [newHeader, ...fields]
            return newTabs
        })
    }

    type setActiveTabCallBack = ((prev: ItemFormField[][]) => ItemFormField[][])
    function setActiveTabFields(value: ItemFormField[][] | setActiveTabCallBack) {
        setLayoutTabs(prev => {
            let newTabs = [...prev]
            const prevValues = prev[activeTabIndex]?.slice(1) as ItemFormField[][]
            const prevHeader = prev[activeTabIndex]?.[0] as ItemLayoutHeader
            newTabs[activeTabIndex] = Array.isArray(value)
                ? [prevHeader, ...value]
                : [prevHeader, ...value(prevValues)]
            return newTabs
        })
    }

    // initializing form default values
    useEffect(() => {
        const defaultTemplate = [
            [
                { type: "left_sidebar", label: "Main" },
                [{ id: "1", type: "tags" }],
                [],
            ]
        ]

        // adding ids to the fields
        let idGen = 1
        const layout = item?.layout
            && item?.layout.map(tab =>
                tab.map((column, i) => i !== 0
                    ? (column as ItemField[]).map(field => ({ ...field, id: String(++idGen) }))
                    : column // header
                ))

        setLayoutTabs(layout || defaultTemplate as any)

        if (item) {
            const { coverPath, posterPath, layout, ...itemData } = item
            const itemSrc = `/users/${item.userId}/${item.listId}/${item.id}`

            const cover = coverPath ? `${itemSrc}/${coverPath}` : null
            const poster = posterPath ? `${itemSrc}/${posterPath}` : null
            itemForm.reset({ ...itemData, cover, poster })
        }
    }, [item])

    return (
        <ItemFormContext.Provider value={{
            tags,
            list,
            item,
            itemForm,
            activeTabFields,
            setActiveTabFields,
            activeTabHeader,
            setActiveTabHeader,
        }}>
            {children}
        </ItemFormContext.Provider>
    )
}