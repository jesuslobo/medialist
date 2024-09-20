import { ItemFormContext, ItemFormField } from "@/components/forms/item/ItemFormProvider"
import SortableMultiContainersWrapper from "@/components/ui/layout/drag&drop/logic/SortableMultiContainersWrapper"
import SortableContainer from "@/components/ui/layout/drag&drop/SortableContainer"
import SortableItem from "@/components/ui/layout/drag&drop/SortableItem"
import { DragOverlay } from "@dnd-kit/core"
import { Dispatch, SetStateAction, useContext } from "react"
import ItemFormFieldsMapper from "./ItemFormFieldMapper"

/**
 * All fields are self-contained, they store their own state and update the containers by themselves
 * I did so since useArrayField doesn't support nested arrays,
 * and I tried to implement my own 'move' function but the state did break consistently,
 * also the containers array didn't sync correctly with useFieldArray's array
*/
export default function ItemFormLayoutSection() {
    const { containers, setContainers } = useContext(ItemFormContext)

    return (
        <SortableMultiContainersWrapper
            containers={containers}
            setContainers={setContainers}
            dragOverLay={(activeItem) => (
                <DragOverlay>
                    {activeItem &&
                        <SortableItem id={activeItem.id} >
                            {activeItem.children}
                        </SortableItem>
                    }
                </DragOverlay>
            )}
        >
            <div className="flex gap-x-3">
                {containers.map((container, rowIndex) => (
                    <SortableContainer
                        key={"container" + rowIndex}
                        className="space-y-2 bg-accented bg-opacity-50 rounded-xl p-1 w-1/2"
                        id={rowIndex + "i"}
                        items={container}
                    >
                        {container.map((item, colIndex) => (
                            <SortableItem id={item.id} key={item.id}>
                                <ItemFormFieldsMapper rowIndex={rowIndex} colIndex={colIndex} type={item.type} />
                            </SortableItem>
                        ))}
                    </SortableContainer>
                ))}
            </div>
        </SortableMultiContainersWrapper>
    )
}

export function useItemFormLayoutField(
    row: number,
    col: number,
    setContainers: Dispatch<SetStateAction<ItemFormField[][]>>
) {
    function set(value: object) {
        setContainers((prev) => {
            let newArray = [...prev]
            newArray[row][col] = { ...newArray[row][col], ...value }
            return newArray
        })
    }

    function remove() {
        setContainers((prev) => {
            let newArray = [...prev]
            newArray[row].splice(col, 1)
            return newArray
        })
    }

    return {
        set,
        remove
    }
}
