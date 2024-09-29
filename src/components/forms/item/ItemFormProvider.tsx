import { SortableItemType } from "@/components/ui/layout/drag&drop/logic/SortableMultiContainersWrapper";
import { TagData } from "@/utils/types/global";
import { ItemData, ItemField } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { createContext, Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props extends ItemFormContext {
    children: React.ReactNode
}

interface ItemFormContext {
    tags: TagData[],
    list: ListData,
    item?: ItemData,
    itemForm: UseFormReturn<ItemFormData>,
    containers: ItemFormField[][],
    setContainers: Dispatch<SetStateAction<ItemFormField[][]>>
}

export type ItemFormField = SortableItemType & ItemField

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
    containers,
    setContainers,
    children,
}: Props) {

    return (
        <ItemFormContext.Provider value={{
            tags,
            list,
            item,
            itemForm,
            containers,
            setContainers,
        }}>
            {children}
        </ItemFormContext.Provider>
    )
}