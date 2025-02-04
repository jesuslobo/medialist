import { useUser } from "@/components/providers/AuthProvider";
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { Button, Card, Checkbox, Chip, cn, Image } from "@heroui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { BiTrashAlt } from "react-icons/bi";
import { BsEye } from "react-icons/bs";

interface TrashData {
    id: string;
    listId: string | null; // listId of items, so its null for lists
    title: string;
    coverPath: string | null;  // coverPath for lists, posterPath for items
    updatedAt: Date;
}

export default function TrashCardCheckBox({ data }: { data: TrashData }) {
    const isItem = Boolean(data.listId)

    const [imageIsLoaded, setImageIsLoaded] = useState(true);
    const { user } = useUser()
    const router = useRouter()
    const imgSrc = isItem && data.coverPath ? `/users/${user.id}/${data.listId}/${data.id}/${thumbnailName(data.coverPath as string, { w: 300 })}`
        : data.coverPath ? `/users/${user.id}/${data.id}/${thumbnailName(data.coverPath, { w: 300 })}` : null

    function pushLink() {
        if (isItem) router.push(`/lists/${data.listId}/${data.id}`)
        else router.push(`/lists/${data.id}`)
    }

    return (
        <Checkbox
            key={data.title}
            value={isItem ? 'i-' + data.id : data.id}
            color="danger"
            icon={<BiTrashAlt />}
            size="lg"
            classNames={{
                base: cn(
                    " bg-accented/50 w-full m-0 p-3 max-w-none min-w-52",
                    " duration-200 hover:bg-accented/70 ",
                    "cursor-pointer rounded-xl border-5 border-transparent",
                    "data-[selected=true]:border-danger",
                ),
            }}
        >
            <article className="w-full h-full  group flex flex-row gap-3 items-center justify-start animate-fade-in">
                <section className="overflow-visible p-0 h-24 aspect-square hover:scale-101 duration-200">
                    {imgSrc && imageIsLoaded
                        ? <Image
                            className="aspect-square h-full object-cover bg-accented shadow-lg"
                            shadow="md"
                            radius="lg"
                            alt={data.title}
                            src={imgSrc}
                            onError={() => setImageIsLoaded(false)}
                        />
                        : <Card
                            className="aspect-square h-full uppercase font-light text-7xl text-foreground shadow-lg items-center justify-center bg-accented"
                            radius="md"
                        >
                            {data.title[0]}
                        </Card>
                    }
                </section>

                <section className="grid flex-grow text-start gap-y-1">
                    <h1 className="text-xl shadow-none duration-200 group-hover:font-bold">
                        {data.title}
                    </h1>
                    <p className="text-sm text-foreground-500">
                        Deleted At: {new Date(data.updatedAt).toLocaleString()}
                    </p>
                    <Chip color={isItem ? 'primary' : 'secondary'} size="sm" variant="solid">
                        {isItem ? "Item" : "List"}
                    </Chip>
                </section>

                <Button className="ml-auto" onPress={pushLink} isIconOnly>
                    <BsEye size={20} />
                </Button>
            </article>

        </Checkbox>
    )

}