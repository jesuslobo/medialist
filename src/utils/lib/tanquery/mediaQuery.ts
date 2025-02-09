import { queryClient } from '@/components/providers/RootProviders'
import { ItemData } from '@/utils/types/item'
import { MediaData } from '@/utils/types/media'
import { queryOptions } from '@tanstack/react-query'
import httpClient from '../httpClient'

/** All Media,
 *  @example Key: ['media', itemId] */
export const allMediaQueryOptions = (itemId: ItemData['id']) => queryOptions<MediaData[]>({
    queryKey: ['all', 'media', itemId],
    queryFn: async () => await httpClient().get(`items/${itemId}/media`),
})

/** Single Media */
export const mediaQueryOptions = (mediaId: MediaData['id']) => queryOptions<MediaData>({
    queryKey: ['media', mediaId],
    queryFn: async () => await httpClient().get(`media/${mediaId}`),
})

/** will create a cache key for each media */
export const setupMediaCache = (mediaArray: MediaData[]) =>
    mediaArray.forEach(media => {
        queryClient.setQueryData(['media', media.id], media)
    })

/** - Edit All Media Cache
 * all Media of an Item share the same cache*/
export const mutateMediaCache = (data: MediaData, type: "edit" | "add" | "delete") => {
    const AllMediaItemsKey = ['all', 'media', data.itemId];

    if (queryClient.getQueryData(AllMediaItemsKey))
        queryClient.setQueryData(AllMediaItemsKey, (oldData: MediaData[]) => {
            const index = type !== 'add' && oldData.findIndex((item) => item.id === data.id);

            switch (type) {
                case 'add':
                    oldData.unshift(data);
                    return oldData;
                case 'delete':
                    oldData.splice(index as number, 1);
                    return oldData;
                case 'edit':
                    oldData[index as number] = data
                    return oldData;
            }
        });

    queryClient.setQueryData(['media', data.id], data)
}