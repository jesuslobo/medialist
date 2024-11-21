import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"
import { useContext } from "react"
import { itemPageContext } from "../ItemPageProvider"
import ItemPagePoster from "./ItemPagePoster"
import { Chip } from "@nextui-org/react"
import { badgeColors } from "@/utils/types/global"
import { twJoin } from "tailwind-merge"

export default function ItemPageHeaderBody() {
    const { item } = useContext(itemPageContext)
    const headerType = item?.header?.type || "poster_beside"

    const itemSrc = `/users/${item.userId}/${item.listId}/${item.id}`
    const posterSrc = item.posterPath && `${itemSrc}/${thumbnailName(item.posterPath, { w: 700 })}`
    const coverSrc = item.coverPath && `${itemSrc}/${thumbnailName(item.coverPath, { w: 700 })}`
    const coverSrc300 = item.coverPath && `${itemSrc}/${thumbnailName(item.coverPath, { w: 300 })}`
    const backgroundImage = (coverSrc || posterSrc) ? `url(${coverSrc || posterSrc})` : undefined
    const bg300 = (coverSrc300 || posterSrc) ? `url(${coverSrc300 || posterSrc})` : undefined

    switch (headerType) {
        case "poster_beside":
            return (
                <div
                    className={`w-full bg-cover bg-center rounded-xl flex items-end ${(coverSrc || posterSrc) ? " pt-52" : ""}`}
                    style={{ backgroundImage }}
                >
                    <section className="bg-pure-theme bg-opacity-75 backdrop-blur-lg w-full px-10 py-8 rounded-lg scale-100.5">
                        <h1 className="text-4xl capitalize font-bold whitespace-pre-wrap">{item.title}</h1>
                        <Badges className="opacity-80 py-2"/>
                        <p className="text-opacity-85">{item.description}</p>
                    </section>
                </div>
            )
        case "poster_on_top":
            return (
                <div
                    className={`w-full bg-cover bg-center rounded-xl flex ${(coverSrc || posterSrc) ? " pt-52" : ""}`}
                    style={{ backgroundImage }}
                >
                    <div
                        className="grid px-10 bg-pure-theme bg-opacity-75 backdrop-blur-lg w-full rounded-lg scale-100.5"
                        style={{ gridTemplateColumns: posterSrc ? 'minmax(10vw, 22vw) minmax(22vw, 75vw)' : '1fr' }}
                    >
                        {posterSrc && <ItemPagePoster className="-mt-24 pb-5" />}
                        <section className="px-10 pb-8 pt-4">
                            <h1 className="text-4xl capitalize font-bold">{item.title}</h1>
                            <Badges />
                            <p className="text-opacity-85 whitespace-pre-wrap">{item.description}</p>
                        </section>
                        {/* layout sidebar */}
                    </div>
                </div>
            )
        case "poster_inside":
            return (
                <div
                    className="w-full bg-cover bg-center rounded-xl grid"
                    style={{ backgroundImage: bg300 }}
                >
                    <div
                        className="grid w-full h-full bg-pure-theme bg-opacity-40 backdrop-blur-lg rounded-lg p-7"
                        style={{
                            gridTemplateColumns: posterSrc ? 'minmax(10vw, 22vw) minmax(22vw, 75vw)' : '1fr'
                        }}
                    >
                        {posterSrc && <ItemPagePoster />}
                        <section className="px-10 pb-8 pt-4">
                            <h1 className="text-4xl capitalize font-bold">{item.title}</h1>
                            <Badges />
                            <p className="text-opacity-85">{item.description}</p>
                        </section>
                    </div>
                </div>
            )
    }

}

function Badges({ className }: { className?: string }) {
    const { tags } = useContext(itemPageContext)
    const badgeable = tags.filter(tag => tag.badgeable)
    return (
        <div className={twJoin(className, "flex flex-wrap gap-1")}>
            {badgeable.map(tag => tag.badgeable && (
                <Chip key={tag.id} size="sm" className="px-2" color={badgeColors.get(tag.badgeable)}>{tag.label}</Chip>
            ))}
        </div>
    )
}