import ItemPageLinkField from "@/components/page/lists/[id]/[itemId]/fields/ItemPageLinkField"
import ImageInput from "@/components/ui/form/ImageUploader"
import { ItemLinkField } from "@/utils/types/item"
import { Button, Input, InputProps } from "@heroui/react"
import { useContext, useEffect, useState } from "react"
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
    const { activeTabFields, setActiveTabFields, item, isPreviewMode } = useContext(ItemFormContext)

    const { set, remove, field, useDebounce } = useItemFormLayoutField<ItemLinkField & { logoPath: File }>(rowIndex, colIndex, setActiveTabFields, activeTabFields)

    const itemDir = item && `/api/file/${item.userId}/${item.listId}/${item.id}`
    const [logo, setLogo] = useState<string | null>(null)
    const [url, setUrl] = useDebounce('url')
    const [label, setLabel] = useDebounce('label')

    const [hover, setHover] = useState(false)

    useEffect(() => {
        if ((field?.logoPath as any) instanceof File) // :D
            readImage(field.logoPath as File)
        else if (typeof field.logoPath === 'string')
            setLogo(`${itemDir}/${field.logoPath}`)
        else setLogo(null)
    }, [field.logoPath])


    const inputProps: InputProps = {
        className: "shadow-sm rounded-xl",
        variant: "bordered",
        type: "text",
        isRequired: true,
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
            onMouseEnter={() => isPreviewMode && setHover(true)}
            onMouseLeave={() => isPreviewMode && setHover(false)}
        >
            {hover || !isPreviewMode
                ? <div className="className flex gap-x-1 items-center animate-fade-in">
                    <Input
                        placeholder="Label"
                        value={label}
                        onValueChange={setLabel}
                        {...inputProps}
                    />
                    :
                    <Input
                        placeholder="Link"
                        value={url}
                        onValueChange={setUrl}
                        validate={(url) => url.match(/^(http|https):\/\/[^ "]+$/i) ? null : 'Invalid URL'}
                        {...inputProps}
                    />

                    <ImageInput
                        className="flex-none"
                        innerContent={<LuImagePlus size={23} />}
                        value={logo}
                        onChange={(logoPath) => set({ logoPath: logoPath as File & string })} // TS ????
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
                    field={{ ...field, logoPath: logo || '' }}
                    isEditing
                />
            }

        </article>
    )
}