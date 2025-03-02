import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"
import { ItemData, ItemImageField } from "@/utils/types/item"
import { Button, Card, Image, ImageProps, useDisclosure } from "@heroui/react"
import React, { useContext, useMemo } from "react"
import { BiImageAdd, BiX } from "react-icons/bi"
import { useItemFormLayoutField } from "../../ItemFormLayoutSection"
import { ItemFormContext, ItemFormMedia } from "../../ItemFormProvider"
import SelectImageModal from "./SelectImageModal"

export default function ItemFormImageField({
    rowIndex,
    colIndex,
}: {
    rowIndex: number,
    colIndex: number,
}) {
    const { activeTabFields, setActiveTabFields, itemForm, item, list, media } = useContext(ItemFormContext)
    const { set, remove, field } = useItemFormLayoutField<ItemImageField>(rowIndex, colIndex, setActiveTabFields, activeTabFields)
    const { imageId } = field

    const itemSrc = item && `/api/file/${list.userId}/${list.id}/${(item as ItemData).id}`
    const newMedia = itemForm.watch('media') as ItemFormMedia[]

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const selectedImage = useMemo(() =>
        newMedia?.find(image => image.ref == imageId) ||
        media?.find(image => image.id === imageId),
        [imageId, newMedia])

    const src = selectedImage && (selectedImage.id !== undefined
        ? `${itemSrc}/${thumbnailName(selectedImage.path, {})}`
        : URL.createObjectURL(selectedImage.path))

    return (<>
        <SelectImageModal isOpen={isOpen} onOpenChange={onOpenChange} set={set} />
        <article className="relative w-full">
            <Button className="absolute top-0 right-0 z-50 mt-2 mr-2" onPress={remove} isIconOnly>
                <BiX className="text-2xl" />
            </Button>
            {selectedImage
                ? <MemoizedImage
                    imageRef={imageId}
                    title="click to view full image"
                    className="w-full h-full object-cover"
                    alt="image-card"
                    src={src}
                    onClick={onOpen}
                />
                : <Card className=" flex items-center justify-center h-full w-full p-4 bg-accented/70 border-none rounded-2xl shadow-lg animate-fade-in">
                    <Button onPress={onOpen} onDragOver={onOpen} size="lg">
                        <BiImageAdd className="text-2xl" /> Select Image
                    </Button>
                </Card>
            }
        </article>
    </>
    )
};

const MemoizedImage = React.memo(function SelectedImage({ ...props }: ImageProps & { imageRef: string | number }) {
    return <Image {...props} />
}, (prev, next) => String(prev.imageRef) === String(next.imageRef))