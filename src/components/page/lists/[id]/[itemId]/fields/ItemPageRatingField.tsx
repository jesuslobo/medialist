import { ItemRatingField } from "@/utils/types/item"
import { Chip } from "@nextui-org/react"
import { BiSolidStar, BiSolidStarHalf, BiStar } from "react-icons/bi"
import { twJoin } from "tailwind-merge"

export default function ItemPageRatingField({
    className,
    field: {
        rating,
        from
    },
}: {
    className?: string
    field: ItemRatingField
}) {
    // true = solid, false = half, null = empty
    const arr: (boolean | null)[] = Array(from).fill(null).map((_, i) => i >= rating ? null : true)
    if (rating % 1 !== 0) arr[Math.floor(rating)] = false

    return (
        <article className={twJoin("flex items-center justify-center gap-x-1 text-warning text-lg", className)}>
            {arr.map((star, i) => {
                return star ? <BiSolidStar key={i + '-star'} />
                    : star === null
                        ? <BiStar key={i + '-star'} />
                        : <BiSolidStarHalf key={i + '-star'} />
            })}
            <Chip size="sm" color="warning" variant="flat">
                {rating} / {from}
            </Chip>
        </article>
    )
}