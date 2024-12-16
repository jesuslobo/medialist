import { Divider } from "@nextui-org/react"
import { useContext } from "react"
import { twJoin } from "tailwind-merge"
import { itemPageContext } from "../ItemPageProvider"
import ItemPageBadges from "../header/Badges"
import ItemPageDeleteButton from "../header/DeleteButton"
import ItemPageEditButton from "../header/EditButton"
import ItemPageLayoutTabs from "../header/LayoutTabs"
import ItemPagePoster from "../header/Poster"

export default function ItemPagePosterInside() {
    const { item, imagePaths } = useContext(itemPageContext)

    return (
        <header
            className="grid w-full bg-cover bg-center rounded-xl"
            style={{ backgroundImage: imagePaths.bg300 }}
        >
            <div
                className="grid w-full h-full bg-pure-theme bg-opacity-40 backdrop-blur-lg rounded-lg p-7"
                style={{
                    gridTemplateColumns: imagePaths.posterSrc ? 'minmax(10vw, 22vw) minmax(22vw, 75vw)' : '1fr'
                }}
            >
                {imagePaths.posterSrc &&
                    <ItemPagePoster className="hover:scale-101" />
                }
                <section className="flex flex-col items-start gap-y-2 px-10 pb-8 pt-4">
                    <h1 className="text-4xl capitalize font-bold line-clamp-2">{item.title}</h1>
                    <ItemPageBadges className="opacity-85" />
                    {item.description &&
                        <p className="text-opacity-85 md:text-sm bg-pure-theme/20 p-3 rounded-lg flex-grow">{item.description}</p>
                    }
                    <Divider className="mt-auto" />
                    <SubNav className="w-full opacity-90" />
                </section>
            </div>
        </header>
    )
}

function SubNav({ className }: { className?: string }) {
    const { item } = useContext(itemPageContext)
    const tabsNumber = item?.layout?.length || 0
    return (
        <div className={twJoin("flex items-center gap-x-2", className)}>
            {tabsNumber !== 0
                ? <ItemPageLayoutTabs variant="light" className="flex-grow" />
                : <div className="flex-grow"></div>
            }
            <div className="flex items-center gap-2">
                <ItemPageDeleteButton />
                <ItemPageEditButton />
            </div>
        </div>
    )
}