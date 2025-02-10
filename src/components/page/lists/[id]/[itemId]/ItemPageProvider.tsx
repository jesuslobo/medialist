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

    const itemSrc = `/users/${item.userId}/${item.listId}/${item.id}`
    const posterSrc = item.posterPath && `${itemSrc}/${thumbnailName(item.posterPath, { w: 700 })}`
    const originalPoster = item.posterPath && `${itemSrc}/${item.posterPath}`
    const coverSrc = item.coverPath && `${itemSrc}/${thumbnailName(item.coverPath, { w: 700 })}`
    const coverSrc300 = item.coverPath && `${itemSrc}/${thumbnailName(item.coverPath, { w: 300 })}`
    const originalCover = item.coverPath && `${itemSrc}/${item.coverPath}`
    const backgroundImage = (coverSrc || posterSrc) ? `url(${coverSrc || posterSrc})` : undefined
    const bg300 = (coverSrc300 || posterSrc) ? `url(${coverSrc300 || posterSrc})` : undefined
    const bg700 = (coverSrc || posterSrc) ? `url(${coverSrc || posterSrc})` : undefined

    const imagePaths = {
        itemSrc,
        posterSrc,
        originalPoster,
        coverSrc,
        coverSrc300,
        originalCover,
        backgroundImage,
        bg300,
        bg700,
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
        itemSrc: string,
        posterSrc?: string,
        originalPoster?: string,
        coverSrc?: string,
        coverSrc300?: string,
        originalCover?: string,
        backgroundImage?: string,
        bg300?: string,
        bg700?: string,
    },
}