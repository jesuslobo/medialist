import { SortableItemType } from "@/components/ui/layout/drag&drop/logic/SortableMultiContainersWrapper";
import { TagData } from "@/utils/types/global";
import { ItemData, ItemField, ItemLayoutHeader } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { createContext, Dispatch, SetStateAction } from "react";
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
    cover: File | null
    poster: File | null
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

        // setActiveTabHeaderFn(value)
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

    return (
        <ItemFormContext.Provider value={{
            tags,
            list,
            item,
            itemForm,
            activeTabFields,
            setActiveTabFields,
            activeTabHeader,
            setActiveTabHeader
        }}>
            {children}
        </ItemFormContext.Provider>
    )
}