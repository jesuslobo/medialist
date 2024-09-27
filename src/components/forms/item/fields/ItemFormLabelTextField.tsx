import { ItemLabelTextField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@nextui-org/react"
import { useContext } from "react"
import { BiX } from "react-icons/bi"
import { ItemFormContext } from "../ItemFormProvider"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"

export default function ItemFormLabelTextField({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { containers, setContainers } = useContext(ItemFormContext)
    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setContainers)

    const currentField = containers[rowIndex][colIndex] as ItemLabelTextField & { id: number }

    const inputProps: InputProps = {
        className: "shadow-sm rounded-xl",
        variant: "bordered",
        type: "text",
    }

    return (
        <article className="flex gap-x-1 items-center">
            <Input
                placeholder="Label"
                value={currentField.label}
                onValueChange={(label) => set({ label })}
                {...inputProps}
            />
            :
            <Input
                placeholder="Body"
                value={currentField.body}
                onValueChange={(body) => set({ body })}
                {...inputProps}
            />
            <Button
                onPress={remove}
                variant="light"
                isIconOnly
            >
                <BiX size={30} />
            </Button>
        </article>
    )
}