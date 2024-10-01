import { ItemFieldType } from "@/utils/types/item";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/react";
import { useContext } from "react";
import { BiLink, BiPlus } from "react-icons/bi";
import { BsCardText } from "react-icons/bs";
import { RxText } from "react-icons/rx";
import { ItemFormContext, ItemFormField } from "../ItemFormProvider";

export default function ItemFormLayoutAddFieldButton() {
    const { setContainers } = useContext(ItemFormContext)

    function addField(type: ItemFieldType, variant?: string) {
        setContainers(prev => {
            let newArray = [...prev]
            const newField = { id: Date.now().toString(), type, variant } as ItemFormField
            newArray[prev.length - 1].unshift(newField) // add it at the top of the last row
            return newArray
        })
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button isIconOnly>
                    <BiPlus size={25} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Add A Field">
                <DropdownSection title="Text">
                    <DropdownItem
                        onPress={() => addField("text", "long")}
                        startContent={<BsCardText />}
                    >
                        Text Box
                    </DropdownItem>
                    <DropdownItem
                        onPress={() => addField("text", "short")}
                        startContent={<RxText />}
                    >
                        Text
                    </DropdownItem>
                    <DropdownItem
                        onPress={() => addField("labelText")}
                        startContent={<RxText />}
                    >
                        Label: Text
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Other">
                    <DropdownItem
                        onPress={() => addField("link")}
                        startContent={<BiLink />}
                    >
                        Link Button
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    )
}