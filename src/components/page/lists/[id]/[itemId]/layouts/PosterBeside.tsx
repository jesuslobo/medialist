import { useContext, useRef } from "react";
import { twJoin } from "tailwind-merge";
import { itemPageContext } from "../ItemPageProvider";
import ItemPageBadges from "../header/Badges";
import ItemPageDeleteButton from "../header/DeleteButton";
import ItemPageDescription from "../header/Description";
import ItemPageEditButton from "../header/EditButton";
import ItemPageLayoutTabs from "../header/LayoutTabs";
import ItemPagePoster from "../header/Poster";

export default function ItemPagePosterBeside() {
    const { item, imagePaths } = useContext(itemPageContext)
    const posterRef = useRef<HTMLImageElement>(null)
    const height = (posterRef.current?.clientHeight || 300) - 16 - 8 - 208 - 120 // 16, 8, 208 are the paddings, 120 is like a margin of error

    return (
        <>
            <header className="grid gap-x-4 overflow-hidden" style={{
                gridTemplateColumns: imagePaths.posterSrc ? 'minmax(22vw, 25vw) minmax(22vw, 75vw)' : '1fr'
            }}>
                {imagePaths.posterSrc &&
                    <ItemPagePoster ref={posterRef} className="hover:scale-101 w= flex-none" /> // need fix, if the weidth is too big, it overlaps with the cover
                }
                <section
                    className={`flex-grow grid w-full h-full bg-cover bg-center rounded-xl overflow-hidden ${imagePaths.backgroundImage ? 'pt-52' : ''}`}
                    style={{ backgroundImage: imagePaths.bg700 }}
                >
                    <div className="grid w-full h-full p-4 bg-pure-theme bg-opacity-40 backdrop-blur-lg rounded-lg">
                        <article className="flex flex-col items-start gap-y-2 px-5 pb-2 pt-2">
                            <h1 className="text-4xl capitalize font-bold line-clamp-2">{item.title}</h1>
                            <ItemPageBadges className="opacity-85" />
                            {item.description &&
                                <ItemPageDescription description={item.description} height={height} />
                            }
                        </article>
                    </div>
                </section>
            </header>
            <SubNav className="w-full p-3 pb-0 opacity-90" />
        </>
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