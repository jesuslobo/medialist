import ImageInput from "@/components/ui/form/ImageUploader"
import { ItemLinkField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@nextui-org/react"
import { useContext } from "react"
import { BiX } from "react-icons/bi"
import { LuImagePlus } from "react-icons/lu"
import { ItemFormContext } from "../ItemFormProvider"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"

export default function ItemFormLinkField({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { containers, setContainers } = useContext(ItemFormContext)
    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setContainers)

    const currentField = containers[rowIndex][colIndex] as ItemLinkField & { id: number, logoPath: File | null }

    const inputProps: InputProps = {
        className: "shadow-sm rounded-xl",
        variant: "bordered",
        type: "text",
    }

    return (
        <div className="flex gap-x-1 items-center">
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
                value={currentField.logoPath}
                onChange={(logoPath) => set({ logoPath })}
            />

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