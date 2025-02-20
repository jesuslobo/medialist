import ImageViewerModal from "@/components/ui/modals/ImageViewerModal"
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"
import { ItemData, ItemImageField } from "@/utils/types/item"
import { Button, Card, Image, useDisclosure } from "@heroui/react"
import { useContext, useMemo, useState } from "react"
import { BiImageAdd, BiPencil, BiX } from "react-icons/bi"
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
    const { activeTabFields, setActiveTabFields, isPreviewMode, itemForm, item, list, media } = useContext(ItemFormContext)
    const { set, remove, field } = useItemFormLayoutField<ItemImageField>(rowIndex, colIndex, setActiveTabFields, activeTabFields)
    const { imageId } = field

    const itemSrc = item && `/users/${list.userId}/${list.id}/${(item as ItemData).id}`
    const newMedia = itemForm.watch('media') as ItemFormMedia[]

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [hover, setHover] = useState(false)

    const selectedImage = useMemo(() =>
        newMedia.find(image => image.ref == imageId) ||
        media.find(image => image.id === imageId),
        [imageId, newMedia])

    const src = selectedImage && (selectedImage.id !== undefined
        ? `${itemSrc}/${thumbnailName(selectedImage.path, { w: 700 })}`
        : URL.createObjectURL(selectedImage.path))

    return (<>
        <SelectImageModal isOpen={isOpen} onOpenChange={onOpenChange} set={set} />
        {(hover || !isPreviewMode) &&
            <div
                className="flex items-center justify-center gap-x-2 pb-3 "
                onMouseEnter={() => isPreviewMode && setHover(true)}
                onMouseLeave={() => isPreviewMode && setHover(false)}
            >
                {selectedImage &&
                    <Button className="flex-grow" onPress={onOpen} onDragOver={onOpen}>
                        <BiPencil className="text-xl" />
                    </Button>}
                <Button className="flex-grow" onPress={remove} >
                    <BiX className="text-2xl" />
                </Button>
            </div>
        }
        {selectedImage
            ? <Image
                title="click to view full image"
                className="w-full h-full object-cover"
                alt="image-card"
                src={src}
                onClick={() => setIsViewOpen(true)}
                onMouseEnter={() => isPreviewMode && setHover(true)}
                onMouseLeave={() => isPreviewMode && setHover(false)}
            />
            : <Card className=" flex items-center justify-center h-full w-full p-4 bg-accented/70 border-none rounded-2xl shadow-lg animate-fade-in">
                <Button onPress={onOpen} onDragOver={onOpen} size="lg">
                    <BiImageAdd className="text-2xl" /> Select Image
                </Button>
            </Card>
        }

        {src &&
            <ImageViewerModal
                imageSrc={src}
                isOpen={isViewOpen}
                setIsOpen={setIsViewOpen}
            />}
    </>
    )
};
