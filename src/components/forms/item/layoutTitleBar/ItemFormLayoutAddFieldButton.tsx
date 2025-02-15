import { ItemField, ItemFieldType } from "@/utils/types/item";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/react";
import { useContext } from "react";
import { BiIdCard, BiImage, BiImages, BiLink, BiPlus, BiSolidStar } from "react-icons/bi";
import { BsCardText } from "react-icons/bs";
import { IoIosImage } from "react-icons/io";
import { RxText } from "react-icons/rx";
import { ItemFormContext, ItemFormField } from "../ItemFormProvider";

export default function ItemFormLayoutAddFieldButton({ rowIndex }: { rowIndex: number }) {
    const { setActiveTabFields } = useContext(ItemFormContext)

    type ItemFieldVariant = Extract<ItemField, { variant: string }>['variant'];
    function addField(type: ItemFieldType, variant?: ItemFieldVariant) {
        setActiveTabFields(prev => {
            let newArray = [...prev]
            const newField = { id: Date.now().toString(), type, variant } as ItemFormField
            newArray[rowIndex].unshift(newField) // add it at the top of the last row
            return newArray
        })
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button className="w-full">
                    <BiPlus size={25} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Add A Field">
                <DropdownSection title="Text">
                    <DropdownItem
                        key="add-long-text-field"
                        onPress={() => addField("text", "long")}
                        startContent={<BsCardText />}
                    >
                        Text Box
                    </DropdownItem>
                    <DropdownItem
                        key="add-short-text-field"
                        onPress={() => addField("text", "short")}
                        startContent={<RxText />}
                    >
                        Text
                    </DropdownItem>
                    <DropdownItem
                        key="add-label-text-field"
                        onPress={() => addField("labelText")}
                        startContent={<RxText />}
                    >
                        Label: Text
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Cards">
                    <DropdownItem
                        key="add-card-banner-field"
                        onPress={() => addField("card", "banner")}
                        startContent={<IoIosImage />}
                    >
                        Banner Card
                    </DropdownItem>
                    <DropdownItem
                        key="add-image-field"
                        onPress={() => addField("card", "profile")}
                        startContent={<BiIdCard />}
                    >
                        Profile Card
                    </DropdownItem >
                </DropdownSection>
                <DropdownSection title="Media">
                    <DropdownItem
                        key="add-gallery-field"
                        onPress={() => addField("gallery")}
                        startContent={<BiImages />}
                    >
                        Gallery
                    </DropdownItem>
                    <DropdownItem
                        key="add-image-field"
                        onPress={() => addField("image")}
                        startContent={<BiImage />}
                    >
                        Image
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Misc.">
                    <DropdownItem
                        key="add-link-field"
                        onPress={() => addField("link")}
                        startContent={<BiLink />}
                    >
                        Link Button
                    </DropdownItem>
                    <DropdownItem
                        key="add-rating-field"
                        onPress={() => addField("rating")}
                        startContent={<BiSolidStar />}
                    >
                        Rating
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    )
}