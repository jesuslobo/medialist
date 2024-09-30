import { ItemLayoutHeader } from "@/utils/types/item";
import type { Selection } from "@nextui-org/react";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/react";
import { useContext, useMemo, useRef, useState } from "react";
import { BiGridAlt } from "react-icons/bi";
import { BsLayoutSidebar, BsLayoutSidebarReverse, BsLayoutSplit, BsLayoutThreeColumns, BsSquare } from "react-icons/bs";
import { ItemFormContext } from "../ItemFormProvider";

export default function ItemFormLayoutChangeLayoutButton() {
    const { itemForm, setContainers } = useContext(ItemFormContext)
    const { getValues, setValue } = itemForm

    const defaultValue = getValues("layout.type") || "left_sidebar"
    const [selectedLayoutKey, setSelectedLayoutKey] = useState<Selection>(new Set([defaultValue]))

    let previousLayoutKey = useRef<ItemLayoutHeader['type']>(defaultValue) // to keep track of the previous layout, for layout updates

    const iconMappings = new Map<string, React.ReactNode>([
        ["one_row", <BsSquare key="one_row_LayoutIcon" size={20} />],
        ["left_sidebar", <BsLayoutSidebar key="left_sidebar_LayoutIcon" size={20} />],
        ["right_sidebar", <BsLayoutSidebarReverse key="right_sidebar_LayoutIcon" size={20} />],
        ["two_rows", <BsLayoutSplit key="two_rows_LayoutIcon" size={20} />],
        ["three_rows", <BsLayoutThreeColumns key="three_rows_LayoutIcon" size={20} />],
    ])

    const rowNumbers = {
        one_row: 1,
        left_sidebar: 2,
        right_sidebar: 2,
        two_rows: 2,
        three_rows: 3
    }

    const selectedLayout = useMemo(() => {
        const newKey = Array.from(selectedLayoutKey).toString() as ItemLayoutHeader['type']
        setValue("layout.type", newKey)

        const oldRowNumber = rowNumbers[previousLayoutKey.current]
        const newRowNumber = rowNumbers[newKey]

        // should create/remove containers (rows)
        // if going for less rows, we just need to merge the last two rows
        if (oldRowNumber > newRowNumber) {
            setContainers(prev => {
                const lastTwoRows = prev.slice(-2)
                const mergedRows = lastTwoRows.flat()
                return [...prev.slice(0, -2), mergedRows]
            })
        } else {
            // if going for more rows, we need to create new rows
            const diff = newRowNumber - oldRowNumber
            const newRows = Array.from({ length: diff }, () => [])
            setContainers(prev => [...prev, ...newRows])
        }

        previousLayoutKey.current = newKey
        return iconMappings.get(newKey) ?? <BiGridAlt size={20} />
    }, [selectedLayoutKey]);

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button isIconOnly>
                    {selectedLayout}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Change Layout"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedLayoutKey}
                onSelectionChange={setSelectedLayoutKey}
                itemClasses={{
                    base: [
                        "flex",
                        "items-center",
                        "justify-center",
                        "text-center",
                        "text-xs",
                        "rounded-md",
                        "py-1",
                        "px-0",
                        "m-0 ",
                        "text-default-500",
                        "transition-opacity",
                        "data-[selected=true]:bg-default-50",
                        "data-[selectable=true]:focus:bg-default-50",
                    ],
                }}
            >
                <DropdownSection className="columns-5 md:columns-3 ">
                    <DropdownItem key="one_row"  >
                        <BsSquare size={20} className="w-full mb-2" />
                        One Row
                    </DropdownItem>
                    <DropdownItem key="left_sidebar" >
                        <BsLayoutSidebar size={20} className="w-full mb-2" />
                        Left Sidebar
                    </DropdownItem>
                    <DropdownItem key="right_sidebar">
                        <BsLayoutSidebarReverse size={20} className="w-full mb-2" />
                        Right Sidebar
                    </DropdownItem>
                    <DropdownItem key="two_rows" >
                        <BsLayoutSplit size={20} className="w-full mb-2" />
                        Two Rows
                    </DropdownItem>
                    <DropdownItem key="three_rows" >
                        <BsLayoutThreeColumns size={20} className="w-full mb-2" />
                        Three Rows
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown >
    )
}