import { useContext } from "react";
import { twJoin } from "tailwind-merge";
import { itemPageContext } from "../ItemPageProvider";
import ItemPageBadges from "../header/Badges";
import ItemPageDeleteButton from "../header/DeleteButton";
import ItemPageEditButton from "../header/EditButton";
import ItemPageLayoutTabs from "../header/LayoutTabs";
import ItemPagePoster from "../header/Poster";

export default function ItemPagePosterBeside() {
    const { item, imagePaths } = useContext(itemPageContext)

    return (
        <>
            <header className="flex flex-row gap-x-4 h-96 overflow-hidden">
                {imagePaths.posterSrc &&
                    <ItemPagePoster className="hover:scale-101 h-full max-w-lg" />
                }
                <div
                    className="flex-grow grid w-full h-full bg-cover bg-center rounded-xl pt-52 overflow-hidden"
                    style={{ backgroundImage: imagePaths.bg300 }}
                >
                    <div className="grid w-full h-full bg-pure-theme bg-opacity-40 backdrop-blur-lg rounded-lg p-7">
                        <section className="flex flex-col items-start gap-y-2 px-5 pb-8 pt-2">
                            <h1 className="text-4xl capitalize font-bold line-clamp-2">{item.title}</h1>
                            <ItemPageBadges className="opacity-85" />
                            {item.description &&
                                <p
                                    title="Click to read more"
                                    className="text-opacity-85 md:text-sm bg-pure-theme/20 rounded-lg p-1 flex-grow line-clamp-1 cursor-pointer"
                                >
                                    {item.description}
                                </p>
                            }
                        </section>
                    </div>
                </div>
            </header>
            <SubNav className="w-full p-3 opacity-90" />
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