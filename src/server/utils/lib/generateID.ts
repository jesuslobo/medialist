import { customAlphabet } from 'nanoid';

export const $generateID = (length: number = 10) => {
    const idGenerator = customAlphabet('123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz', length);
    return idGenerator();
}

/** for lists, items, and users */
export const $generateShortID = () => $generateID(14);

/** for media, and tags */
export const $generateLongID = () => $generateID(20);