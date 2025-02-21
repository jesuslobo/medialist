import ItemPageCardField from "@/components/page/lists/[id]/[itemId]/fields/cards/ItemPageCardField"
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"
import { ItemCardField, ItemData } from "@/utils/types/item"
import { Button, Image, Input, InputProps, Textarea, TextAreaProps, useDisclosure } from "@heroui/react"
import { useContext, useMemo, useState } from "react"
import { BiImageAdd, BiX } from "react-icons/bi"
import { useItemFormLayoutField } from "../../ItemFormLayoutSection"
import { ItemFormContext, ItemFormMedia } from "../../ItemFormProvider"
import SelectImageModal from "../media/SelectImageModal"

export default function ItemFormCardField({
    rowIndex,
    colIndex,
}: {
    rowIndex: number,
    colIndex: number,
}) {
    const { activeTabFields, setActiveTabFields, isPreviewMode, itemForm, item, list, media } = useContext(ItemFormContext)
    const useField = useItemFormLayoutField<ItemCardField>(rowIndex, colIndex, setActiveTabFields, activeTabFields)
    const { set, field } = useField
    const { imageId, variant } = field
    const itemSrc = item && `/api/file/${list.userId}/${list.id}/${(item as ItemData).id}`
    const newMedia = itemForm.watch('media') as ItemFormMedia[]

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [hover, setHover] = useState(false)

    const selectedImage = useMemo(() =>
        newMedia.find(image => image.ref == imageId) ||
        media.find(image => image.id === imageId),
        [imageId, newMedia])

    const src = (selectedImage && (selectedImage.id !== undefined
        ? `${itemSrc}/${thumbnailName(selectedImage.path, { w: 700 })}`
        : URL.createObjectURL(selectedImage.path))) as string

    return (<>
        <SelectImageModal isOpen={isOpen} onOpenChange={onOpenChange} set={set} />
        <article
            onMouseEnter={() => isPreviewMode && setHover(true)}
            onMouseLeave={() => isPreviewMode && setHover(false)}
        >
            {(hover || !isPreviewMode)
                ? variant === "banner"
                    ? <BannerForm useField={useField} >
                        {selectedImage
                            ? <Image
                                title="click to view full image"
                                className="w-full h-full object-cover aspect-square"
                                alt="image-card"
                                src={src}
                                onClick={onOpen}
                            />
                            : <Button onPress={onOpen} onDragOver={onOpen} className="aspect-square w-full h-40">
                                <BiImageAdd className="text-2xl" /> Select Image
                            </Button>
                        }
                    </BannerForm>
                    : <ProfileForm useField={useField} >
                        {selectedImage
                            ? <Image
                                title="click to view full image"
                                className="h-36 object-cover aspect-square"
                                alt="image-card"
                                src={src}
                                onClick={onOpen}
                            />
                            : <Button onPress={onOpen} onDragOver={onOpen} className="aspect-square h-36">
                                <BiImageAdd className="text-4xl" />
                            </Button>
                        }
                    </ProfileForm>
                : <ItemPageCardField field={{ src, ...field }} isEditing />
            }
        </article>
    </>)
};

const inputProps: InputProps & TextAreaProps = {
    variant: "bordered",
    type: "text"
}

interface FormProps {
    useField: ReturnType<typeof useItemFormLayoutField<ItemCardField>>,
    children?: React.ReactNode
}

function BannerForm({
    useField,
    children
}: FormProps) {
    const { remove, useDebounce } = useField
    const [title, setTitle] = useDebounce("title")
    const [subText, setSubText] = useDebounce("subText")

    return (
        <div className="grid gap-y-2">
            <Button onPress={remove} className=" w-full">
                <BiX className="text-2xl" />
            </Button>
            {children}
            <Input
                {...inputProps}
                placeholder="Title..."
                value={title}
                onValueChange={setTitle}
                isRequired
            />
            <Input
                {...inputProps}
                placeholder="Subtext..."
                value={subText}
                onValueChange={setSubText}
            />
        </div>
    )
}

function ProfileForm({
    useField,
    children
}: FormProps) {
    const { remove, useDebounce } = useField

    const [title, setTitle] = useDebounce("title")
    const [subText, setSubText] = useDebounce("subText")

    return (
        <div className="flex flex-row gap-2">
            {children}
            <div className="grid gap-y-2 flex-grow items-start">
                <div className="flex flex-row gap-2">
                    <Input
                        {...inputProps}
                        placeholder="Title..."
                        value={title}
                        onValueChange={setTitle}
                        isRequired
                    />
                    <Button
                        onPress={remove}
                        variant="light"
                        isIconOnly
                    >
                        <BiX size={30} />
                    </Button>
                </div>
                <Textarea
                    {...inputProps}
                    placeholder="Subtext..."
                    className="flex-grow h-full"
                    value={subText}
                    onValueChange={setSubText}
                />
            </div>
        </div>
    )
}