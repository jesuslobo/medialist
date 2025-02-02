import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { badgeColors, TagData } from "@/utils/types/global";
import { ItemData } from "@/utils/types/item";
import { Card, Chip, Image } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ItemCardsList({
    item,
    tagsData,
}: {
    item: ItemData,
    tagsData?: TagData[]
}) {
    const [imageIsLoaded, setImageIsLoaded] = useState(true);
    const router = useRouter()
    const pageLink = `/lists/${item.listId}/${item.id}`

    return (
        <div className="flex h-52 shadow-lg bg-default/10 rounded-xl">
            <Card
                className="h-52 aspect-2/3 flex-none z-10 shadow-lg hover:scale-105 duration-200"
                onPress={() => router.push(pageLink)}
                isPressable
            >
                {item.posterPath && imageIsLoaded
                    ? <Image
                        className="aspect-[2/3] object-cover"
                        alt={item.title}
                        src={`/users/${item.userId}/${item.listId}/${item.id}/${thumbnailName(item.posterPath, { w: 700 })}`}
                        onError={() => setImageIsLoaded(false)}
                    />
                    : <Card className="aspect-[2/3] h-full w-full p-2 bg-accented flex items-center justify-center capitalize text-xl" >
                        {item.title}
                    </Card>
                }
            </Card>
            <Card
                className="flex-grow p-5 h-full bg-default/20 hover:bg-default/40"
                onPress={() => router.push(pageLink)}
                isPressable
            >
                <p className="text-start text-2xl font-bold px-1 pb-1 duration-200 hover:text-gray-400">
                    {item.title}
                </p>
                <div className="flex flex-wrap gap-1">
                    {tagsData?.map(tag => tag.badgeable &&
                        item.tags.some(tagId => tag.id === tagId) && (
                            <Chip
                                key={tag.id}
                                size="sm"
                                className="px-2 bg-opacity-90"
                                color={badgeColors.get(tag.badgeable)}
                            >
                                {tag.label}
                            </Chip>
                        ))}
                </div>
                <p className="h-20 overflow-hidden py-1 text-left">
                    {item.description}
                </p>
            </Card>

        </div>
    )
}