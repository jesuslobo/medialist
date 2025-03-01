import useIntersectionObserver from "@/utils/hooks/useIntersectionObserver";
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ItemData } from "@/utils/types/item";
import { Card, CardFooter, Image } from "@heroui/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ItemCard({
    item,
    onPress,
    className,
}: {
    item: ItemData
    onPress?: () => void
    className?: string
}) {
    const { ref, isIntersecting } = useIntersectionObserver({rootMargin: '300px', threshold: 0.1});
    const [imageIsLoaded, setImageIsLoaded] = useState(true);
    const router = useRouter()

    function onPressFn() {
        router.push(`/lists/${item.listId}/${item.id} `)
    }

    return (
        <Card
            ref={ref}
            radius="lg"
            className={className}
            onPress={onPress || onPressFn}
            isFooterBlurred
            isPressable
        >
            {item.posterPath && imageIsLoaded
                ? <Image
                    alt={item.title}
                    className="object-cover aspect-[2/3]"
                    src={isIntersecting ? `/api/file/${item.userId}/${item.listId}/${item.id}/${thumbnailName(item.posterPath, { w: 640 })}` : undefined}
                    onError={() => setImageIsLoaded(false)}
                />
                : <Card className=" aspect-2/3 h-full w-full p-2 bg-accented flex items-center justify-center capitalize text-xl">
                    {item.title}
                </Card>
            }

            <CardFooter className="justify-center items-center ml-1 z-10 bottom-1 py-1 absolute before:bg-white/10 border-white/5 border-1 before:rounded-xl rounded-large w-[calc(100%_-_8px)] shadow-small ">
                <p className="capitalize text-small TEXT text-foreground/80 line-clamp-1 group-hover:line-clamp-3 drop-shadow-lg" >
                    {item.title}
                </p>
            </CardFooter>
        </Card>
    )
}