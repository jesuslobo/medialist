import { Divider } from "@heroui/react"
import { useContext, useRef } from "react"
import { itemPageContext } from "../ItemPageProvider"
import ItemPageBadges from "../header/Badges"
import ItemPageDescription from "../header/Description"
import ItemPagePoster from "../header/Poster"
import ItemPageSubNav from "../header/SubNav"

export default function ItemPagePosterInside() {
    const { item, imagePaths } = useContext(itemPageContext)
    const headerRef = useRef<HTMLDivElement>(null)
    const posterRef = useRef<HTMLImageElement>(null)
    const tabsRef = useRef<HTMLDivElement>(null)
    const height = (posterRef?.current?.height || 400) - (headerRef.current?.clientHeight || 0) - (tabsRef.current?.clientHeight || 0) - 100

    return (
        <header
            className={`grid w-full bg-cover bg-center rounded-xl ${imagePaths.bgSrc ? '' : 'bg-pure-theme'}`}
            style={{ backgroundImage: imagePaths.bgLowest }}
        >
            <div
                className={`grid w-full h-full bg-pure-theme backdrop-blur-lg rounded-lg p-7 ${imagePaths.bgSrc ? 'bg-opacity-40' : ''}`}
                style={{
                    gridTemplateColumns: imagePaths.posterSrc ? 'minmax(10vw, 22vw) minmax(22vw, 75vw)' : '1fr'
                }}
            >
                {imagePaths.posterSrc &&
                    <ItemPagePoster className="hover:scale-101" ref={posterRef} />
                }
                <section className="flex flex-col items-start gap-y-2 px-10 pb-8 pt-4">
                    <section className="flex flex-col items-start gap-y-2 w-full" ref={headerRef}>
                        <h1 className="text-4xl capitalize font-bold line-clamp-2">{item.title}</h1>
                        <ItemPageBadges className={imagePaths.bgSrc ? "opacity-85" : undefined} />
                    </section>

                    {item.description
                        ? <ItemPageDescription description={item.description} height={height} />
                        : <div className="flex-grow"></div>
                    }
                    <section className="flex flex-col items-start gap-y-2 w-full" ref={tabsRef}>
                        <Divider className="mt-auto" />
                        <ItemPageSubNav className="w-full opacity-90" />
                    </section>
                </section>
            </div>
        </header>
    )
}