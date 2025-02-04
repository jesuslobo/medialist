import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ListData } from "@/utils/types/list";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ListCard({ list }: { list: ListData }) {
    const [imageIsLoaded, setImageIsLoaded] = useState(true);
    const router = useRouter()

    return (
        <Card
            className=" group bg-transparent duration-200 hover:scale-110 cubic-bezier animate-fade-in"
            key={list.title}
            shadow="none"
            isPressable
            onPress={() => router.push(`/lists/${list.id}`)}
        >
            <CardBody className="overflow-visible p-0 ">
                {list.coverPath && imageIsLoaded
                    ? <Image
                        shadow="md"
                        radius="lg"
                        alt={list.title}
                        className=" object-cover aspect-square bg-accented shadow-lg"
                        src={`/users/${list.userId}/${list.id}/${thumbnailName(list.coverPath, { w: 300 })}`}
                        onError={() => setImageIsLoaded(false)}
                    />
                    : <Card
                        className="aspect-square uppercase font-light text-7xl text-foreground shadow-lg items-center justify-center bg-accented"
                        radius="lg"
                    >
                        {list.title[0]}
                    </Card>
                }
            </CardBody>

            <CardFooter className="text-small capitalize h-full w-full py-3 flex items-start justify-center  shadow-none duration-200 group-hover:font-bold">
                {list.title}
            </CardFooter>
        </Card>
    )
}