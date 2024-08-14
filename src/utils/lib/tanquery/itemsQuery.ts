import { queryClient } from '@/components/providers/RootProviders'
import { ItemData } from '@/utils/types/item'
import { queryOptions } from '@tanstack/react-query'
import httpClient from '../httpClient'
import { ListData } from '@/utils/types/list'

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
    const isDelete = type === "delete";
    const isAdd = type === "add";
    const isEdit = type === "edit";
    const listItemsKey = ['items', data.listId, { trash: false }];

    if (queryClient.getQueryData(listItemsKey)) // for the list page
        queryClient.setQueryData(listItemsKey, (oldData: ItemData[]) => {
            if (isEdit) return oldData.map((item) => item.id === data.id ? data : item)

            const allItems = isAdd ? oldData
                : oldData.filter((list) => list.id !== data.id); //remove the old list
            return isDelete
                ? allItems
                : [...allItems, data].sort((a, b) => a.title.localeCompare(b.title)); //sort based on title
        });

    if (queryClient.getQueryData(trashItemsKey)) // for trash page
        queryClient.invalidateQueries({ queryKey: trashItemsKey })

    queryClient.setQueryData(['item', data.id], data)
}