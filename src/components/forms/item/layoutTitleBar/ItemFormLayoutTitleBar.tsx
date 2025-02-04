import TitleBar from "@/components/ui/bars/TitleBar";
import ToggleButton from "@/components/ui/buttons/ToggleButton";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { Dispatch, SetStateAction, useContext } from "react";
import { BiDotsVerticalRounded, BiPlus } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { ItemFormContext, ItemFormLayoutTab } from "../ItemFormProvider";
import ItemFormLayoutChangeLayoutButton from "./ItemFormLayoutChangeLayoutButton";
import ItemFormLayoutTabs from "./ItemFormLayoutTabs";

export default function ItemFormLayoutTitleBar({
    layoutTabs,
    setLayoutTabs,
    activeTabIndex,
    setActiveTabIndex,
}: {
    layoutTabs: ItemFormLayoutTab[],
    setLayoutTabs: Dispatch<SetStateAction<ItemFormLayoutTab[]>>,
    activeTabIndex: number,
    setActiveTabIndex: Dispatch<SetStateAction<number>>,
}) {
    const { isPreviewMode, setIsPreviewMode } = useContext(ItemFormContext)

    function addTab() {
        const oldTabsNum = layoutTabs.length
        setLayoutTabs(prev => {
            let newArray = [...prev]
            newArray.push([{ type: "left_sidebar", label: `Tab ( ${oldTabsNum + 1} )` }, [], []])
            return newArray
        })
        setActiveTabIndex(oldTabsNum)
    }

    return (
        <TitleBar
            className="bg-accented py-3 px-5 my-3"
            title="Layout"
            middleContent={
                <div className="flex items-center justify-center pl-10">
                    <ItemFormLayoutTabs
                        layoutTabs={layoutTabs}
                        setLayoutTabs={setLayoutTabs}
                        activeTabIndex={activeTabIndex}
                        setActiveTabIndex={setActiveTabIndex}
                    />
                    <Button onPress={addTab} radius="full" size="sm" variant="flat" isIconOnly >
                        <BiPlus size={15} />
                    </Button>
                </div>
            }
        >
            <div className="flex items-center gap-x-2">
                <ToggleButton
                    isToggled={isPreviewMode}
                    setIsToggled={setIsPreviewMode}
                    title="Preview"
                    isIconOnly
                >
                    <BsEye size={20} />
                </ToggleButton>

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

