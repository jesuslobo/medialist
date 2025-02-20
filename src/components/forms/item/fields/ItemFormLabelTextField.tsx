import ItemPageLabelTextField from "@/components/page/lists/[id]/[itemId]/fields/ItemPageLabelTextField"
import ToggleButton from "@/components/ui/buttons/ToggleButton"
import { ItemLabelTextField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@heroui/react"
import { useContext, useState } from "react"
import { BiX } from "react-icons/bi"
import { MdOutlineNumbers } from "react-icons/md"
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
    const { set, remove, field, useDebounce } = useItemFormLayoutField<ItemLabelTextField>(rowIndex, colIndex, setActiveTabFields, activeTabFields)
    const { countable } = field

    const [label, setLabel] = useDebounce("label")
    const [body, setBody] = useDebounce("body")
    const [hover, setHover] = useState(false)

    const inputProps: InputProps = {
        className: "shadow-sm rounded-xl",
        variant: "bordered",
        type: "text"
    }

    return (
        <article
            onMouseEnter={() => isPreviewMode && setHover(true)}
            onMouseLeave={() => isPreviewMode && setHover(false)}
        >
            {hover || !isPreviewMode ?
                <div className="flex gap-x-1 items-center animate-fade-in">
                    <Input
                        placeholder="Label"
                        value={label}
                        onValueChange={setLabel}
                        {...inputProps}
                        isRequired
                    />
                    :<Input
                        placeholder="Body"
                        type={countable ? "number" : "text"}
                        value={body}
                        onValueChange={setBody}
                        {...inputProps}
                    />
                    <ToggleButton
                        title="Countable? if yes it will show plus & minus buttons"
                        isToggled={Boolean(countable)}
                        setIsToggled={() => set({ countable: !countable })}
                        isIconOnly
                    >
                        <MdOutlineNumbers size={30} />
                    </ToggleButton>
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
                    field={field}
                    isEditing
                />
            }

        </article>
    )
}