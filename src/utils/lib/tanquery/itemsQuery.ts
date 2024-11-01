import { queryClient } from '@/components/providers/RootProviders'
import { ItemData } from '@/utils/types/item'
import { ListData } from '@/utils/types/list'
import { queryOptions } from '@tanstack/react-query'
import httpClient from '../httpClient'

export const trashItemsKey = ['items', { trash: true }]

/** All Items,
 *  @example Key: ['items', listId, { trash: false }] */
export const itemsQueryOptions = (listId: ListData['id']) => queryOptions<ItemData[]>({
    queryKey: ['items', listId, { trash: false }],
    queryFn: async () => await httpClient().get(`lists/${listId}/items`),
})

/** Single Item */
export const itemQueryOptions = (itemId: ItemData['id']) => queryOptions<ItemData>({
    queryKey: ['item', itemId],
    queryFn: async () => await httpClient().get(`items/${itemId}`),
})

/** will create a cache key for each item */
export const setupItemsCache = (items: ItemData[]) =>
    items.forEach(item => {
        queryClient.setQueryData(['item', item.id], item)
    })

/** - Edit All Items Cache
 * all items of a list share the same cache*/
export const mutateItemCache = (data: ItemData, type: "edit" | "add" | "delete") => {
    const listItemsKey = ['items', data.listId, { trash: false }];

    if (queryClient.getQueryData(listItemsKey)) // for the list page
        queryClient.setQueryData(listItemsKey, (oldData: ItemData[]) => {
            const index = type !== 'add' && oldData.findIndex((item) => item.id === data.id);

            switch (type) {
                case 'add':
                    oldData.push(data);
                    oldData.sort((a, b) => a.title.localeCompare(b.title));
                    return oldData;
                case 'delete':
                    oldData.splice(index as number, 1);
                    return oldData;
                case 'edit':
                    oldData[index as number] = data
                    oldData.sort((a, b) => a.title.localeCompare(b.title));
                    return oldData;
            }
        });

    if (queryClient.getQueryData(trashItemsKey)) // for trash page
        queryClient.invalidateQueries({ queryKey: trashItemsKey })

    queryClient.setQueryData(['item', data.id], data)
}