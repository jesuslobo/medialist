import TitleBar from "@/components/ui/bars/TitleBar";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import ItemFormLayoutAddFieldButton from "./ItemFormLayoutAddFieldButton";
import ItemFormLayoutChangeLayoutButton from "./ItemFormLayoutChangeLayoutButton";

export default function ItemFormLayoutTitleBar() {
    return (
        <TitleBar
            className="bg-accented py-3 px-5 my-3"
            title="Layout"
        >
            <div className="flex items-center gap-x-2">
                <ItemFormLayoutAddFieldButton />
                <ItemFormLayoutChangeLayoutButton />

                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly>
                            <BiDotsVerticalRounded size={20} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Layout Options">
                        <DropdownItem >Save As a Template</DropdownItem>
                        <DropdownItem >Load A Template</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </TitleBar>
    )
}

