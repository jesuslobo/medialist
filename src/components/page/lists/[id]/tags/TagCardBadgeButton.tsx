import { badgeColors, TagData } from "@/utils/types/global"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection } from "@heroui/react"
import { useState } from "react"
import { UseFormSetValue } from "react-hook-form"
import { FaDiamond } from "react-icons/fa6"
import { LuDiamond } from "react-icons/lu"

type TagForm = Omit<TagData, 'id' | 'userId' | 'listId'>

export default function TagCardBadgeButton({
    badgeable: tagDataBadgeable,
    setValue,
}: {
    badgeable: TagData['badgeable'],
    setValue: UseFormSetValue<TagForm>
}) {
    const [badgeable, _setBadgeable] = useState<Selection>(new Set([tagDataBadgeable || ""]))
    const badge = Array.from(badgeable).toString() as TagData['badgeable']

    function setBadgeable(badge: Selection) {
        setValue('badgeable', Array.from(badge).toString() as TagData['badgeable'])
        _setBadgeable(badge)
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button color={badge ? badgeColors.get(badge) : "default"} className="rounded-sm" isIconOnly>
                    {badge ? <FaDiamond size={20} /> : <LuDiamond size={20} />}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Change Tag Color Layout"
                selectionMode="single"
                selectedKeys={badgeable}
                onSelectionChange={setBadgeable}
            >
                <DropdownSection>
                    {Array.from(badgeColors).map(([name, color]) => color
                        ? <DropdownItem
                            key={name}
                            color={color}
                            className=" text-center flex items-center justify-center"
                            startContent={<span className={`bg-${color} hover:bg-foreground-400 h-6 aspect-square rounded-full`} />}
                        >
                            <span>{name}</span>
                        </DropdownItem>
                        : <></>
                    )}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown >
    )
};