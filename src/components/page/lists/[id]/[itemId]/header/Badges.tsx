import { useContext } from "react"
import { twJoin } from "tailwind-merge"
import { itemPageContext } from "../ItemPageProvider"
import { badgeColors } from "@/utils/types/global"
import { Chip } from "@heroui/react"

export default function ItemPageBadges({ className }: { className?: string }) {
    const { tags } = useContext(itemPageContext)
    const badgeable = tags.filter(tag => tag.badgeable)
    return (
        <div className={twJoin(className, "flex flex-wrap gap-1")}>
            {badgeable.map(tag => tag.badgeable && (
                <Chip key={tag.id} size="sm" className="px-2" color={badgeColors.get(tag.badgeable)}>
                    {tag.label}
                </Chip>
            ))}
        </div>
    )
}