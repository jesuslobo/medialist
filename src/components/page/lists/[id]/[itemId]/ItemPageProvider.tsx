import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions";
import { TagData } from "@/utils/types/global";
import { ItemData } from "@/utils/types/item";
import { MediaData } from "@/utils/types/media";
import { createContext, Dispatch, SetStateAction, useState } from "react";

export const itemPageContext = createContext({} as itemPageContext)

export function ItemPageProvider({
    children,
    item,
    tags,
    media,
}: {
    children: React.ReactNode,
    item: ItemData,
    tags: TagData[],
    media: MediaData[],
}) {
    const headerType = item?.header?.type || "poster_beside"
    const [activeTabIndex, setActiveTabIndex] = useState(0)

    const itemSrc = `/api/file/${item.userId}/${item.listId}/${item.id}`

    const posterSrc = item.posterPath && `${itemSrc}/${item.posterPath}`
    const posterSrcThumb = item.posterPath && `${itemSrc}/${thumbnailName(item.posterPath, {})}`
    const posterSrcThumb720 = item.posterPath && `${itemSrc}/${thumbnailName(item.posterPath, { w: 720 })}`

    const coverSrc = item.coverPath && `${itemSrc}/${item.coverPath}`
    const coverSrcThumb = item.coverPath && `${itemSrc}/${thumbnailName(item.coverPath, {})}`
    const coverSrcThumb300 = item.coverPath && `${itemSrc}/${thumbnailName(item.coverPath, { w: 300 })}`

    const imagePaths = {
        itemSrc,
        posterSrc,
        posterSrcThumb,
        posterSrcThumb720,
        coverSrc,
        coverSrcThumb,
        coverSrcThumb300,
        bgSrc: (coverSrc || posterSrc) ? `url(${coverSrc || posterSrc})` : undefined,
        bgThumb: (coverSrcThumb || posterSrcThumb) ? `url(${coverSrcThumb || posterSrcThumb})` : undefined,
        bgLowest: (coverSrcThumb300 || posterSrcThumb720) ? `url(${coverSrcThumb300 || posterSrcThumb720})` : undefined,
    }

    return (
        <itemPageContext.Provider value={{
            item,
            tags,
            media,
            headerType,
            activeTabIndex,
            setActiveTabIndex,
            imagePaths,
        }}>
            {children}
        </itemPageContext.Provider>
    )
}

interface itemPageContext {
    item: ItemData,
    tags: TagData[],
    media: MediaData[],
    headerType: ItemData['header']['type'],
    activeTabIndex: number,
    setActiveTabIndex: Dispatch<SetStateAction<number>>,
    imagePaths: {
        itemSrc: string;
        posterSrc?: string;
        posterSrcThumb?: string;
        posterSrcThumb720?: string;
        coverSrc?: string;
        coverSrcThumb?: string;
        coverSrcThumb300?: string;
        bgSrc?: string;
        bgThumb?: string;
        bgLowest?: string;
    }
}