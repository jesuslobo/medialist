import TitleBar from "@/components/ui/bars/TitleBar";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { useContext } from "react";
import { BiDotsVerticalRounded, BiPlus } from "react-icons/bi";
import { ItemFormContext } from "../ItemFormProvider";
import ItemFormLayoutChangeLayoutButton from "./ItemFormLayoutChangeLayoutButton";

export default function ItemFormLayoutTitleBar() {
    const { containers, setContainers } = useContext(ItemFormContext)

    return (
        <TitleBar
            className="bg-accented py-3 px-5 my-3"
            title="Layout"
        >
            <div className="flex items-center gap-x-2">
                {/* Add Field */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly>
                            <BiPlus size={25} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Add A Field">
                        <DropdownItem >Fields...</DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                {/* Change Layout */}
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

