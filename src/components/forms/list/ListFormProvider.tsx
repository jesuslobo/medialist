import { ListData } from "@/utils/types/list";
import { createContext, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

interface ListFormContext {
    list?: ListData,
    listForm: UseFormReturn<ListFormData>,
}

interface Props extends ListFormContext {
    children: React.ReactNode
}

export interface ListFormData extends Omit<ListData, "id" | "createdAt" | "updatedAt" | 'coverPath' | 'userId'> {
    cover: File | null | string
}

export const ListFormContext = createContext({} as ListFormContext)

export default function ListFormProvider({
    children,
    list,
    listForm,
}: Props) {

    useEffect(() => {
        if (!list) return

        const listSrc = `/users/${list.userId}/${list.id}`

        listForm.reset({
            title: list?.title,
            cover: list.coverPath ? `${listSrc}/${list.coverPath}` : null,
        })
    }, [list])

    return (
        <ListFormContext.Provider value={{
            list,
            listForm,
        }}>
            {children}
        </ListFormContext.Provider>
    )
};