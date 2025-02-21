import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { HTMLAttributes, JSX } from "react"
import SortableItem from "./SortableItem"
import { SortableItemType } from "./logic/SortableMultiContainersWrapper"

type DivAttributes = Omit<HTMLAttributes<HTMLUListElement>, 'children'>

interface props<T extends SortableItemType> extends DivAttributes {
    id: string
    items: T[],
    /** Pass fallback Sortable Item */
    fallbackItem?: ({ item }: { item: T }) => JSX.Element
    // props.sortableItem is to pass the component as a prop for cleaner code, and I don't want to disable react/no-children-prop rule
    /** Custom Items Iterator
     *
     * Don't forget to add  \<SortableItem id={item.id}...>
     * otherwise items won't be dragable
     * */
    children?: React.ReactNode
}

export default function SortableContainer<T extends SortableItemType>({
    id,
    items,
    fallbackItem,
    children,
    ...props
}: props<T>) {
    const { setNodeRef } = useDroppable({ id })

    return (
        <SortableContext
            id={id}
            items={items}
            strategy={verticalListSortingStrategy}
        >
            <ul {...props} ref={setNodeRef}>
                {children ||
                    items.map((item) => (
                        <SortableItem id={item.id} key={item.id + 'sortableItem'}>
                            {item.children || fallbackItem?.({ item })}
                        </SortableItem>
                    ))}
            </ul>
        </SortableContext>
    )
}