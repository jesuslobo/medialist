import { ItemRatingField } from "@/utils/types/item"
import { Button, Chip, Input } from "@heroui/react"
import { useContext, useState } from "react"
import { BiPencil, BiSave, BiSolidStar, BiSolidStarHalf, BiStar, BiX, BiXCircle } from "react-icons/bi"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"
import { ItemFormContext } from "../ItemFormProvider"

export default function ItemFormRatingField({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { activeTabFields, setActiveTabFields } = useContext(ItemFormContext)
    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setActiveTabFields)
    const { from, rating } = activeTabFields[rowIndex][colIndex] as ItemRatingField & { id: number }

    if (from === undefined || rating === undefined)
        set({ from: 10, rating: 0 })

    const [visibleRating, setVisibleRating] = useState(rating)
    const [isEditing, setIsEditing] = useState(false)

    // true = solid, false = half, null = empty
    const arr: (boolean | null)[] = Array(from).fill(null).map((_, i) => i >= visibleRating ? null : true)
    if (visibleRating % 1 !== 0) arr[Math.floor(visibleRating)] = false

    const starProps = (i: number = -1) => ({
        className: "hover:scale-150 cursor-pointer duration-200",
        onMouseEnter: () => setVisibleRating(i + 1),
        onMouseLeave: () => setVisibleRating(rating),
        onClick: () => {
            set({ rating: i + 1 })
            setVisibleRating(i + 1)
        }
    })

    return (

        <article className=" flex items-center justify-center gap--x-1 animate-fade-in" >
            <div className="flex-grow flex items-center justify-center gap-x-1 text-warning text-xl" >
                <BiXCircle
                    {...starProps(-1)}
                    className="-mb-[0.5px] text-foreground-400 hover:text-foreground-500 cursor-pointer duration-200"
                />
                {arr.map((star, i) => {
                    return star
                        ? <BiSolidStar key={i + '-star'} {...starProps(i)} />
                        : star === null
                            ? <BiStar key={i + '-star'} {...starProps(i)} />
                            : <BiSolidStarHalf key={i + '-star'} {...starProps(i)} />
                })}
                {isEditing
                    ? <>
                        <Input
                            className="w-20"
                            size="sm"
                            type="number"
                            color="warning"
                            onClick={e => e.stopPropagation()}
                            defaultValue={String(from)}
                            min={0}
                            max={12}
                            onValueChange={(value) => set({ from: Number(value) })}
                            startContent={
                                <button
                                    className="hover:bg-warning-300 hover:text-foreground duration-200  p-1 rounded-lg"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <BiSave />
                                </button>
                            }
                        />
                    </>
                    : <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        className="px-2 cursor-pointer hover:bg-warning-100 duration-200"
                        endContent={<BiPencil className="text-foreground-500" title="Edit Ratio" />}
                        onClick={() => setIsEditing(true)}
                    >

                        {visibleRating} / {from}

                    </Chip>}
            </div>

            <Button
                onPress={remove}
                variant="light"
                isIconOnly
            >
                <BiX size={30} />
            </Button>
        </article >
    )
}

