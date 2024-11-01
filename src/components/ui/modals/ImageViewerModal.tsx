import { Button, Card, CardFooter, CardHeader, Image } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { BiX } from "react-icons/bi";

export default function ImageViewerModal({
    imageSrc,
    originalSrc,
    isOpen,
    setIsOpen,
    children,
    className
}: {
    imageSrc: string,
    originalSrc?: string,
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    children?: React.ReactNode,
    /** Footer className */
    className?: string
}) {

    return isOpen && createPortal(
        <div
            className="fixed top-0 w-full h-full flex items-center justify-center z-[999]
                      bg-pure-theme/40 backdrop-blur-md animate-fade-in"
            onClick={() => setIsOpen(false)}
        >
            <Card
                className="group animate-none h-[90%] max-w-[90%] bg-accented/80"
                onClick={e => e.stopPropagation()}
            >
                <CardHeader className="absolute flex gap-x-2 w-fit z-30 top-1 right-1 overflow-hidden p-1">
                    <Button
                        className="flex-none"
                        onClick={() => setIsOpen(false)}
                        isIconOnly
                    >
                        <BiX className="text-2xl" />
                    </Button>
                </CardHeader>

                <Image
                    className="object-contain h-[90vh] max-w-[90vw] w-full"
                    src={imageSrc}
                    alt={"viewImage"}
                    title={originalSrc ? "Click to view original image" : "Click to view image"}
                    onClick={() => window.open(originalSrc || imageSrc, "_blank")}
                    onError={() => setIsOpen(false)}
                />

                {children &&
                    <CardFooter className={className} >
                        {children}
                    </CardFooter>
                }
            </Card>
        </div>
        , document.body
    )
}