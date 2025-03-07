import httpClient from "@/utils/lib/httpClient"
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery"
import { ItemField, ItemLabelTextField, ItemSaveResponse } from "@/utils/types/item"
import { Button, ButtonGroup } from "@heroui/react"
import { useMutation } from "@tanstack/react-query"
import { useContext } from "react"
import { BiMinus, BiPlus } from "react-icons/bi"
import { twJoin } from "tailwind-merge"
import { itemPageContext } from "../ItemPageProvider"

type Props = { field: ItemLabelTextField, className?: string }
    & ({ isEditing: true, rowIndex?: undefined, colIndex?: undefined } |
    { isEditing?: false, rowIndex: number, colIndex: number })

export default function ItemPageLabelTextField({
    field,
    className,
    isEditing,
    colIndex,
    rowIndex,
}: Props) {
    const { item, activeTabIndex } = useContext(itemPageContext)
    const { body, label, countable } = field
    const value = countable ? (isNaN(Number(body)) ? 0 : Number(body)) : body

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().patch(`items/${item.id}`, formData),
        onSuccess: ({ item }: ItemSaveResponse) => mutateItemCache(item, "edit"),
    })

    const update = (val: number) => {
        if (isEditing || rowIndex === undefined || colIndex === undefined) return

        let newLayout = [...item.layout]
        // "+ 1" because we are skipping the header row, thus the index is off by 1
        const col = newLayout[activeTabIndex][colIndex + 1] as ItemField[]
        col[rowIndex] = { ...col[rowIndex], body: String(val) } as ItemLabelTextField

        const formData = new FormData()
        formData.append("layout", JSON.stringify(newLayout))
        mutation.mutate(formData)
    }

    return (
        <article className={twJoin("flex items-center gap-x-1", className)}>
            <b>{label}</b>: {value}
            {countable &&
                <>
                    <div className="flex-grow"></div>
                    <ButtonGroup>
                        <Button
                            onPress={() => update((value as number) - 1)}
                            size="sm"
                            isIconOnly
                        >
                            <BiMinus />
                        </Button>
                        <Button
                            onPress={() => update((value as number) + 1)}
                            size="sm"
                            isIconOnly
                        >
                            <BiPlus />
                        </Button>
                    </ButtonGroup>
                </>}
        </article>
    )
}