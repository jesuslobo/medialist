import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragStartEvent, KeyboardSensor, Over, PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";

export interface SortableItemType {
    id: UniqueIdentifier | string
    children?: React.ReactNode
}

type Container<T extends SortableItemType> = T[]
type Containers<T extends SortableItemType> = Container<T>[]

interface props<T extends SortableItemType> {
    containers: Containers<T>,
    setContainers: Dispatch<SetStateAction<Containers<T>>>
    children?: ReactNode
    /** <DragOverlay> */
    dragOverLay?: (activeItem: T | null) => JSX.Element
}

// Credits Goes To: https://codesandbox.io/p/sandbox/dnd-kit-multi-containers-lknfe for the main logic
export default function SortableMultiContainersWrapper<T extends SortableItemType>({
    containers,
    setContainers,
    children,
    dragOverLay
}: props<T>) {
    const [activeItem, setActiveItem] = useState<T | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    function findContainer(id: string | UniqueIdentifier) {
        if ((id as string)?.endsWith('i')) return parseInt(id as string) // if it's a container
        // else we find the container by the id of the item we are over
        return containers.findIndex((container) => container.some((item) => item.id === id))
    }

    function handleDragStart({ active: { id } }: DragStartEvent) {
        const active = containers.flat().find((item) => item.id === id) as T
        setActiveItem(active);
    }

    function handleDragOver({
        active,
        over,
        draggingRect
    }: DragOverEvent & {
        draggingRect: DOMRect & { offsetTop: number },
        over: Over & { rect: { offsetTop: number } }
    }) {
        const activeContainerIndex = findContainer(active?.id)
        const overContainerIndex = findContainer(over?.id)

        if (activeContainerIndex === overContainerIndex ||
            activeContainerIndex === -1 ||
            overContainerIndex === -1
        ) return

        const activeItems = containers[activeContainerIndex]
        const overItems = containers[overContainerIndex]

        const activeIndex = activeItems.findIndex(item => item.id === active.id)
        const overIndex = overItems.findIndex(item => item.id === over.id)

        let newIndex

        if ((over.id as string)?.endsWith('i')) {
            // We're at the root droppable of a container
            newIndex = overItems.length + 1
        } else {
            const isBelowLastItem =
                over &&
                overIndex === overItems.length - 1 &&
                draggingRect?.offsetTop > over.rect.offsetTop + over.rect.height

            const modifier = isBelowLastItem ? 1 : 0

            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
        }

        const itemsBefore = containers[overContainerIndex].slice(0, newIndex)
        const itemsAfter = containers[overContainerIndex].slice(newIndex, containers[overContainerIndex].length)

        let newArray = [...containers]

        newArray[activeContainerIndex] = activeItems.filter(item => item.id !== active.id)
        newArray[overContainerIndex] = [...itemsBefore, containers[activeContainerIndex][activeIndex], ...itemsAfter]

        setContainers(newArray)
    }

    function handleDragEnd({ active, over }: DragEndEvent & { over: Over }) {
        const activeContainerIndex = findContainer(active?.id)
        const overContainerIndex = findContainer(over?.id)

        if (activeContainerIndex !== overContainerIndex ||
            activeContainerIndex === -1 ||
            overContainerIndex === -1
        ) return

        const activeIndex = containers[activeContainerIndex].findIndex((item) => item.id === active.id)
        const overIndex = containers[overContainerIndex].findIndex((item) => item.id === over.id)

        setActiveItem(null)

        if (activeIndex === overIndex) return

        let newArray = [...containers]
        newArray[activeContainerIndex] = containers[activeContainerIndex].filter((item) => item.id !== active.id)
        newArray[overContainerIndex] = arrayMove(containers[overContainerIndex], activeIndex, overIndex)

        setContainers(newArray)
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {children}
                {dragOverLay?.(activeItem)}
            </DndContext>
        </>
    )
}