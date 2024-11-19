import { ListData } from "@/utils/types/list";
import { createContext } from "react";
import { UseFormReturn } from "react-hook-form";

interface ListFormContext {
    list?: ListFormData,
    listForm: UseFormReturn<ListFormData>,
}

interface Props extends ListFormContext {
    children: React.ReactNode
}

export interface ListFormData extends Omit<ListData, "id" | "createdAt" | "updatedAt" | 'coverPath' | 'userId'> {
    cover: File | null
}

export const ListFormContext = createContext({} as ListFormContext)

export default function ListFormProvider({
    children,
    list,
    listForm,
}: Props) {
    return (
        <ListFormContext.Provider value={{
            list,
            listForm,
        }}>
            {children}
        </ListFormContext.Provider>
    )
};