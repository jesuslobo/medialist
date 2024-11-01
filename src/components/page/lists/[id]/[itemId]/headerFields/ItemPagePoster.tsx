import ImageViewerModal from "@/components/ui/modals/ImageViewerModal";
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { Image } from "@nextui-org/react";
import { useContext, useState } from "react";
import { itemPageContext } from "../ItemPageProvider";
import { twJoin } from "tailwind-merge";

export default function ItemPagePoster({
    className,
}: {
    className?: string
}) {
    const { item } = useContext(itemPageContext)

    const [isOpen, setIsOpen] = useState(false)
    const [imageIsLoaded, setImageIsLoaded] = useState(true);

    const itemSrc = `/users/${item.userId}/${item.listId}/${item.id}`
    const posterSrc = item.posterPath && `${itemSrc}/${thumbnailName(item.posterPath, { w: 700 })}`
    const originalPoster = item.posterPath && `${itemSrc}/${item.posterPath}`

    return imageIsLoaded && <>
        <Image
            className={twJoin("w-full shadow-xl object-cover duration-100 hover:scale-102.5 cursor-pointer", className)}
            alt={item.title}
            src={posterSrc}
            onClick={() => setIsOpen(true)}
            onError={() => setImageIsLoaded(false)}
        />
        {item.posterPath &&
            <ImageViewerModal
                imageSrc={originalPoster as string}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />}
    </>
}