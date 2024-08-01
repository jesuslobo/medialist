import { AuthContext } from "@/components/providers/AuthProvider";
import { UserData } from "@/utils/types/global";
import { ListData } from "@/utils/types/list";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";

export default function ListCard({ list }: { list: ListData }) {
    const { userData } = useContext(AuthContext)
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
                        src={`/media/${userData.id}/${list.id}/thumbnails/${list.coverPath}_size=300xH.webp`}
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