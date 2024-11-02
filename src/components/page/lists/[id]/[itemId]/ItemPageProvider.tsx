import { TagData } from "@/utils/types/global";
import { ItemData } from "@/utils/types/item";
import { createContext } from "react";

export const itemPageContext = createContext({} as itemPageContext)

export function ItemPageProvider({
    children,
    item,
    tags
}: itemPageContext & {
    children: React.ReactNode,
}) {
    return (
        <itemPageContext.Provider value={{
            item,
            tags
        }}>
            {children}
        </itemPageContext.Provider>
    )
}

interface itemPageContext {
    item: ItemData,
    tags: TagData[]
}