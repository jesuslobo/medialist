import ImageInput from "@/components/ui/form/ImageUploader"
import { ItemLinkField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@nextui-org/react"
import { useContext, useEffect, useState } from "react"
import { BiX } from "react-icons/bi"
import { LuImagePlus } from "react-icons/lu"
import { useItemFormLayoutField } from "../ItemFormLayoutSection"
import { ItemFormContext } from "../ItemFormProvider"
import ItemPageLinkField from "@/components/page/lists/[id]/[itemId]/fields/ItemPageLinkField"

export default function ItemFormLinkField({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { activeTabFields, setActiveTabFields, item, isPreviewMode } = useContext(ItemFormContext)

    const { set, remove } = useItemFormLayoutField(rowIndex, colIndex, setActiveTabFields)
    const currentField = activeTabFields[rowIndex][colIndex] as ItemLinkField & { id: number, logoPath: File | null | string }

    const itemDir = item && `/users/${item.userId}/${item.listId}/${item.id}`
    const [logo, setLogo] = useState<string | null>(null)

    const [hover, setHover] = useState(false)

    useEffect(() => {
        if ((currentField?.logoPath as any) instanceof File) // :D
            readImage(currentField.logoPath as File)
        else if (typeof currentField.logoPath === 'string')
            setLogo(`${itemDir}/${currentField.logoPath}`)
        else setLogo(null)
    }, [currentField.logoPath])


    const inputProps: InputProps = {
        className: "shadow-sm rounded-xl",
        variant: "bordered",
        type: "text",
    }

    function readImage(file: File) {
        if (!file) return null
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
            setLogo(fileReader.result as string)
        }
        return null
    }

    return (
        <article
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {hover || !isPreviewMode
                ? <div className="className flex gap-x-1 items-center animate-fade-in">
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
                </div>
                : <ItemPageLinkField
                    className=" animate-fade-in"
                    field={{ ...currentField, logoPath: logo || '' }}
                    isEditing
                />
            }

        </article>
    )
}