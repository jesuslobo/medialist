
export interface ThumbnailOptions {
    /** If not provided will be 'auto' */
    w?: number;
    /** If not provided will be 'auto' */
    h?: number;
    /** If both empty, It will just transform the image to webp */
}

export const thumbnailName = (fileName: string, thumbnailsOptions: ThumbnailOptions, disablePrefix?: boolean) => {
    const isOriginalSize = !thumbnailsOptions?.w && !thumbnailsOptions?.h;
    const thumbnail = isOriginalSize
        ? `${fileName}.webp`
        : `${fileName}_size=${thumbnailsOptions?.w || 'W'}x${thumbnailsOptions?.h || 'H'}.webp`
    return disablePrefix ? thumbnail : `thumbnails/${thumbnail}`;
};

//** rename it to thumbnailsOptions */
export const coverThumbnailsOptions: Record<string, ThumbnailOptions[]> & {
    listCover: ThumbnailOptions[];
    itemPoster: ThumbnailOptions[];
    itemCover: ThumbnailOptions[];
    itemImage: ThumbnailOptions[];
    logo: ThumbnailOptions[];
} = {
    listCover: [{ w: 300 }],
    itemPoster: [{ w: 300 }, { w: 700 }, {}],
    // itemPoster: [{ h: 300 }, { h: 700 }, {}], 
    itemCover: [{ w: 300 }, { w: 700 }, {}],
    itemImage: [{ w: 300 }, { w: 700 }, {}],
    logo: [{ w: 50 }],
}

/**
 * Folder Structure
 * users/ userId / listId /
 *                        / list's cover & logos
 *                        / thumbnails / ...
 *                        / itemId / item's poster & cover
 *                        / itemId / thumbnails / ...
 */