import { Button, Divider } from "@heroui/react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { useContext, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { itemPageContext } from "../ItemPageProvider"
import ItemPageBadges from "../header/Badges"
import ItemPageDeleteButton from "../header/DeleteButton"
import ItemPageEditButton from "../header/EditButton"
import ItemPageLayoutTabs from "../header/LayoutTabs"
import ItemPagePoster from "../header/Poster"
import ItemPageDescription from "../header/Description"

export default function ItemPagePosterInside() {
    const { item, imagePaths } = useContext(itemPageContext)
    const headerRef = useRef<HTMLDivElement>(null)
    const posterRef = useRef<HTMLImageElement>(null)
    const tabsRef = useRef<HTMLDivElement>(null)
    const height = (posterRef?.current?.height || 400) - (headerRef.current?.clientHeight || 0) - (tabsRef.current?.clientHeight || 0) - 100

    return (
        <header
            className={`grid w-full bg-cover bg-center rounded-xl ${imagePaths.backgroundImage ? '' : 'bg-pure-theme'}`}
            style={{ backgroundImage: imagePaths.bg300 }}
        >
            <div
                className={`grid w-full h-full bg-pure-theme backdrop-blur-lg rounded-lg p-7 ${imagePaths.backgroundImage ? 'bg-opacity-40' : ''}`}
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
                        <ItemPageBadges className={imagePaths.backgroundImage ? "opacity-85" : undefined} />
                    </section>

                    {item.description
                        ? <ItemPageDescription description={item.description} height={height} />
                        : <div className="flex-grow"></div>
                    }
                    <section className="flex flex-col items-start gap-y-2 w-full" ref={tabsRef}>
                        <Divider className="mt-auto" />
                        <SubNav className="w-full opacity-90" />
                    </section>
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