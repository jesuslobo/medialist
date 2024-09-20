import { SortableItemType } from "@/components/ui/layout/drag&drop/logic/SortableMultiContainersWrapper";
import { ItemData, ItemField } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { createContext, Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props extends ItemFormContext {
    children: React.ReactNode
}

interface ItemFormContext {
    list: ListData,
    item?: ItemData,
    itemForm: UseFormReturn<ItemFormData, any, undefined>,
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
    list,
    item,
    itemForm,
    containers,
    setContainers,
    children,
}: Props) {

    return (
        <ItemFormContext.Provider value={{
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