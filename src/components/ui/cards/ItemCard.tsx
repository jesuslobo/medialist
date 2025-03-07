import { ListPageContext } from "@/components/page/lists/[id]/ListPageProvider";
import useIntersectionObserver from "@/utils/hooks/useIntersectionObserver";
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { twJoin } from "tailwind-merge";

export default function ItemCard({
    item,
    onPress,
    className,
}: {
    item: ItemData
    onPress?: () => void
    className?: string
}) {
    const { list: { configs: listConfigs } } = useContext(ListPageContext)

    const configs: ListData['configs'] = listConfigs?.titlePlacement
        ? listConfigs
        : { // fallback
            titlePlacement: 'title-below'
        }

    const { ref, isIntersecting } = useIntersectionObserver({ rootMargin: '300px', threshold: 0.1 });
    const router = useRouter()

    function onPressFn() {
        router.push(`/lists/${item.listId}/${item.id} `)
    }

    return (
        <Card
            title={item.title}
            ref={ref}
            radius="lg"
            shadow="none"
            className={twJoin(
                'group',
                className,
                configs.titlePlacement !== 'title-below' && 'aspect-2/3'
            )}
            onPress={onPress || onPressFn}
            isFooterBlurred={configs.titlePlacement === 'title-overlay'}
            isPressable
        >
            <Body item={item} isIntersecting={isIntersecting} configs={configs} />
            <Footer title={item.title} titlePlacement={configs.titlePlacement} />
        </Card>
    )
}

function Body({
    item,
    isIntersecting,
    configs
}: {
    item: ItemData,
    isIntersecting: boolean,
    configs: ListData['configs']
}) {
    const [imageIsLoaded, setImageIsLoaded] = useState(true);
    const src = `/api/file/${item.userId}/${item.listId}/${item.id}/${thumbnailName(item?.posterPath as string, { w: 640 })}`

    if (!imageIsLoaded) {
        return (
            <article  className="aspect-2/3 h-full w-full">
                <Card className="h-full w-full p-2 bg-accented flex items-center justify-center capitalize text-xl">
                    {item.title}
                </Card>
            </article>
        );
    }

    switch (configs.titlePlacement) {
        case 'title-below':
            return (
                <CardBody className="overflow-visible p-0 shadow-lg rounded-2xl">
                    <Image
                        alt={item.title}
                        className="object-cover aspect-2/3"
                        src={isIntersecting ? src : undefined}
                        onError={() => setImageIsLoaded(false)}
                        width="100%"
                    />
                </CardBody>
            )
        case 'title-overlay':
        case "hidden":
        default:
            return (
                <Image
                    alt={item.title}
                    className="object-cover aspect-2/3 w-full shadow-lg"
                    src={isIntersecting ? src : undefined}
                    onError={() => setImageIsLoaded(false)}
                />
            )
    }
}

function Footer({
    title,
    titlePlacement
}: {
    title: string,
    titlePlacement: ListData['configs']['titlePlacement']
}) {

    switch (titlePlacement) {
        case 'title-overlay':
            return (
                <CardFooter className="justify-center items-center ml-1 z-10 bottom-1 py-1 absolute before:bg-white/10 border-white/5 border-1 before:rounded-xl rounded-large w-[calc(100%_-_8px)] shadow-small ">
                    <p className="capitalize text-small text-foreground/80 line-clamp-1 group-hover:line-clamp-3 drop-shadow-lg" >
                        {title}
                    </p>
                </CardFooter>
            )
        case 'title-below':
            return (
                <CardFooter className="h-full w-full flex items-start justify-center bg-background">
                    <p className="capitalize text-foreground/80 line-clamp-3 group-hover:font-bold" >
                        {title}
                    </p>
                </CardFooter>
            )
        default:
            return <></>
    }
}