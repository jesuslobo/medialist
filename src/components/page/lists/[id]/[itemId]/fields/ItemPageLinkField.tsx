import { ItemLinkField } from "@/utils/types/item"
import { Button, Image } from "@nextui-org/react"
import { useContext, useState } from "react"
import { itemPageContext } from "../ItemPageProvider"
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"

export default function ItemPageLinkField({
    field: {
        label,
        url,
        logoPath,
    }
}: {
    field: ItemLinkField
}) {
    const { item } = useContext(itemPageContext)

    const [imageIsLoaded, setImageIsLoaded] = useState(true)

    const itemSrc = `/users/${item.userId}/${item.listId}/${item.id}`
    const logoSrc = logoPath && `${itemSrc}/${thumbnailName(logoPath, { w: 50 })}`

    return (
        <a href={url} target="_blank" className="h-fit w-full">
            <Button className="capitalize font-bold text-opacity-80 w-full shadow-lg hover:scale-101"
                startContent={logoSrc && imageIsLoaded ?
                    <Image
                        src={logoSrc}
                        className="object-contain h-6"
                        key={'link' + label}
                        alt={`link-logo ${url}`}
                        onError={() => setImageIsLoaded(false)}
                    /> : undefined
                }
            >
                {label}
            </Button>
        </a>
    )
}