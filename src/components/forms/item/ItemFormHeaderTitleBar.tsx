import TitleBar from "@/components/ui/bars/TitleBar";
import { ItemHeader } from "@/utils/types/item";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection, SharedSelection } from "@nextui-org/react";
import { useContext, useState } from "react";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { ItemFormContext } from "./ItemFormProvider";

export default function ItemFormHeaderTitleBar({
    children
}: {
    children?: React.ReactNode
}) {
    const { itemForm } = useContext(ItemFormContext)
    const { getValues, setValue } = itemForm

    const defaultSelected = getValues("header.type") as ItemHeader['type']
    const [selectedKey, setSelectedKey] = useState<Selection>(new Set([defaultSelected]))
    const selectedLayout = Array.from(selectedKey).toString() as ItemHeader['type']

    function updateLayout(value: SharedSelection) {
        const newValue = value.currentKey as ItemHeader['type']
        setValue("header.type", newValue)
        setSelectedKey(new Set([newValue]))
    }

    const iconMappings = new Map<string, React.ReactNode>([
        ["poster_inside", <BsLayoutSidebarInset key="poster_inside_LayoutIcon" size={20} />],
        ["poster_beside", <TbLayoutSidebarFilled key="poster_beside_LayoutIcon" size={25} />],
    ])

    return (
        <TitleBar
            className="bg-accented py-3 px-5 mb-3"
            title="Header"
        >
            <div className="flex items-center gap-x-2">
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly>
                            {iconMappings.get(selectedLayout)}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Change Header's Layout"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedKey}
                        onSelectionChange={updateLayout}
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
                        <DropdownSection className="columns-2">
                            <DropdownItem key="poster_beside" textValue="poster_beside" >
                                <TbLayoutSidebarFilled size={25} className="w-full mb-2" />
                                Poster Beside
                            </DropdownItem>
                            <DropdownItem key="poster_inside" textValue="poster_inside"  >
                                <BsLayoutSidebarInset size={25} className="w-full mb-2" />
                                Poster Inside
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown >
                {children}
            </div>
        </TitleBar>
    )
}