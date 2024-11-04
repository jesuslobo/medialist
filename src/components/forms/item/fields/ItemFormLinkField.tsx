import ImageInput from "@/components/ui/form/ImageUploader"
import { ItemLinkField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@nextui-org/react"
import { useContext } from "react"
import { BiX } from "react-icons/bi"
import { LuImagePlus } from "react-icons/lu"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"
import { ItemFormContext } from "../ItemFormProvider"

export default function ItemFormLinkField({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { activeTabFields, setActiveTabFields, item } = useContext(ItemFormContext)

    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setActiveTabFields)
    const currentField = activeTabFields[rowIndex][colIndex] as ItemLinkField & { id: number, logoPath: File | null | string }

    const itemSrc = item && `/users/${item.userId}/${item.listId}/${item.id}`
    const logo = typeof currentField.logoPath === 'string'
        ? `${itemSrc}/${currentField.logoPath}`
        : currentField.logoPath

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
                placeholder="Link"
                value={currentField.url}
                onValueChange={(url) => set({ url })}
                {...inputProps}
            />

            <ImageInput
                className="flex-none"
                innerContent={<LuImagePlus size={23} />}
                value={logo}
                onChange={(logoPath) => set({ logoPath })}
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