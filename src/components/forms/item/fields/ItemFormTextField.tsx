import { ItemTextField } from "@/utils/types/item"
import { Button, Input, Textarea } from "@nextui-org/react"
import { useContext } from "react"
import { BiX } from "react-icons/bi"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"
import { ItemFormContext } from "../ItemFormProvider"

export default function ItemFormTextField({
    rowIndex,
    colIndex,
}: {
    rowIndex: number,
    colIndex: number,
}) {
    const { containers, setContainers } = useContext(ItemFormContext)
    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setContainers)

    const currentField = containers[rowIndex][colIndex] as ItemTextField & { id: number }

    const props = {
        className: "shadow-sm rounded-xl",
        type: "text",
        value: currentField.text,
        onValueChange: (text: string) => set({ text })
    }

    return (
        <div className="flex gap-x-1 items-center">
            {currentField.variant === "short"
                ? <Input
                    variant="bordered"
                    label="Text"
                    {...props}
                />
                : <Textarea
                    variant="bordered"
                    label="long Text"
                    {...props}
                />
            }

            <Button
                onPress={remove}
                variant="light"
                isIconOnly
            >
                <BiX size={30} />
            </Button>
        </div>
    )
}