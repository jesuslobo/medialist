import { ItemTextField } from "@/utils/types/item"
import { Button, Input, Textarea } from "@heroui/react"
import { useContext, useState } from "react"
import { BiX } from "react-icons/bi"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"
import { ItemFormContext } from "../ItemFormProvider"
import ItemPageTextField from "@/components/page/lists/[id]/[itemId]/fields/ItemPageTextField"

export default function ItemFormTextField({
    rowIndex,
    colIndex,
}: {
    rowIndex: number,
    colIndex: number,
}) {
    const { activeTabFields, setActiveTabFields, isPreviewMode } = useContext(ItemFormContext)
    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setActiveTabFields)

    const currentField = activeTabFields[rowIndex][colIndex] as ItemTextField & { id: number }

    const [hover, setHover] = useState(false)

    const props = {
        className: "shadow-sm rounded-xl",
        type: "text",
        value: currentField.text,
        onValueChange: (text: string) => set({ text })
    }

    return (
        <article
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {hover || !isPreviewMode ?
                <div className="flex gap-x-1 items-center animate-fade-in">
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
                : <ItemPageTextField
                    className="animate-fade-in px-2"
                    field={currentField}
                />
            }
        </article>
    )
}