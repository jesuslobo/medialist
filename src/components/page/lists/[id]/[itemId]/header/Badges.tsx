import { badgeColors } from "@/utils/types/global"
import { Chip } from "@heroui/react"
import { useContext } from "react"
import { BiSolidStar } from "react-icons/bi"
import { twJoin } from "tailwind-merge"
import { itemPageContext } from "../ItemPageProvider"

export default function ItemPageBadges({ className }: { className?: string }) {
    const { tags, item } = useContext(itemPageContext)
    const badgeable = tags.filter(tag => tag.badgeable)
    return (
        <div className={twJoin(className, "flex flex-wrap gap-1")}>
            {item.fav &&
                <Chip size="sm" className="px-2 animate-fade-in text-foreground" color="warning">
                    <BiSolidStar />
                </Chip>}
            {badgeable.map(tag => tag.badgeable && (
                <Chip key={tag.id} size="sm" className="px-2" color={badgeColors.get(tag.badgeable)}>
                    {tag.label}
                </Chip>
            ))}
        </div>
    )
}