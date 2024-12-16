import ImageViewerModal from "@/components/ui/modals/ImageViewerModal";
import { Image } from "@nextui-org/react";
import { useContext, useState } from "react";
import { twJoin } from "tailwind-merge";
import { itemPageContext } from "../ItemPageProvider";

export default function ItemPagePoster({
    className,
}: {
    className?: string
}) {
    const { item, imagePaths } = useContext(itemPageContext)
    const { posterSrc, originalPoster } = imagePaths

    const [isOpen, setIsOpen] = useState(false)
    const [imageIsLoaded, setImageIsLoaded] = useState(true);

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