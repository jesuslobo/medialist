import ItemPageLabelTextField from "@/components/page/lists/[id]/[itemId]/fields/ItemPageLabelTextField"
import { ItemLabelTextField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@heroui/react"
import { useContext, useState } from "react"
import { BiX } from "react-icons/bi"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"
import { ItemFormContext } from "../ItemFormProvider"

export default function ItemFormLabelTextField({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { activeTabFields, setActiveTabFields, isPreviewMode } = useContext(ItemFormContext)
    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setActiveTabFields)

    const currentField = activeTabFields[rowIndex][colIndex] as ItemLabelTextField & { id: number }

    const [hover, setHover] = useState(false)

    const inputProps: InputProps = {
        className: "shadow-sm rounded-xl",
        variant: "bordered",
        type: "text",
    }

    return (
        <article
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {hover || !isPreviewMode ?
                <div className="flex gap-x-1 items-center animate-fade-in">
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
                </div>
                : <ItemPageLabelTextField
                    className="animate-fade-in px-2"
                    field={currentField}
                />
            }

        </article>
    )
}