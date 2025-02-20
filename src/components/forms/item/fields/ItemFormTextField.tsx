import ItemPageTextField from "@/components/page/lists/[id]/[itemId]/fields/ItemPageTextField"
import { ItemTextField } from "@/utils/types/item"
import { Button, Input, Textarea } from "@heroui/react"
import { useContext, useState } from "react"
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
    const { activeTabFields, setActiveTabFields, isPreviewMode } = useContext(ItemFormContext)
    const { remove, field, useDebounce } = useItemFormLayoutField<ItemTextField>(rowIndex, colIndex, setActiveTabFields, activeTabFields)

    const [text, setText] = useDebounce('text')
    const [hover, setHover] = useState(false)

    const props = {
        className: "shadow-sm rounded-xl",
        type: "text",
        value: text,
        onValueChange: setText,
        isRequired: true
    }

    return (
        <article
            onMouseEnter={() => isPreviewMode && setHover(true)}
            onMouseLeave={() => isPreviewMode && setHover(false)}
        >
            {hover || !isPreviewMode ?
                <div className="flex gap-x-1 items-center animate-fade-in">
                    {field.variant === "short"
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
                    field={field}
                />
            }
        </article>
    )
}