import { ItemData } from "@/utils/types/item";
import { createContext } from "react";




export const itemPageContext = createContext({} as itemPageContext)

export function ItemPageProvider({
    children,
    item
}: {
    children: React.ReactNode,
    item: ItemData
}) {
    return (
        <itemPageContext.Provider value={{
            item,
        }}>
            {children}
        </itemPageContext.Provider>
    )
}

interface itemPageContext {
    item: ItemData
}