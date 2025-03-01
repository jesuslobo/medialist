import ImageViewerModal from "@/components/ui/modals/ImageViewerModal";
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ItemImageField } from "@/utils/types/item";
import { Image } from "@heroui/react";
import { useContext, useMemo, useState } from "react";
import { itemPageContext } from "../../ItemPageProvider";

export default function ItemPageImageField({
    field
}: {
    field: ItemImageField
}) {
    const { media, imagePaths: { itemSrc } } = useContext(itemPageContext)

    const [isOpen, setIsOpen] = useState(false)
    const [imageIsLoaded, setImageIsLoaded] = useState(true)

    const image = useMemo(() => media.find(image => image.id === field.imageId), [media])
    if (!image) return <></>
    const src = `${itemSrc}/${image.path}`
    const thumbnailSrc = `${itemSrc}/${thumbnailName(image.path, {})}`

    return (
        <>
            {imageIsLoaded &&
                <Image
                    className="w-full shadow-xl object-cover duration-100 hover:scale-102.5 cursor-pointer"
                    alt={src}
                    src={thumbnailSrc}
                    onClick={() => setIsOpen(true)}
                    onError={() => setImageIsLoaded(false)}
                />}
            <ImageViewerModal
                imageSrc={src as string}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
        </>
    )
}