import { queryClient } from "@/components/providers/RootProviders"
import { ListData } from "@/utils/types/list"
import { queryOptions } from "@tanstack/react-query"
import httpClient from "../httpClient"

export const allListsKey = ['lists', { trash: false }]
export const trashListsKey = ['lists', { trash: true }]

/** All Lists
 * will create a cache key for all lists
 * @example Key: ['lists', { trash: false }]
*/
export const listsQueryOptions = () => queryOptions<ListData[]>({
    queryKey: allListsKey,
    queryFn: async () => await httpClient().get('lists?trash=false'),
})

/** will create a cache key for each list */
export const setupListsCache = (lists: ListData[]) =>
    lists.forEach(list => {
        queryClient.setQueryData(['list', list.id], list)
    })

/** Single List
 * will create a cache key for a single list
 * @example Key: ['list', listId]
 */
export const singleListQueryOptions = (listId: string) => queryOptions<ListData>({
    queryKey: ['list', listId],
    queryFn: async () => await httpClient().get(`lists/${listId}`),
})

/** - Edit AllLists Cache wiht a single List's info
 * all lists share the same cache */
export const mutateListCache = (data: ListData, type: "edit" | "add" | "delete" /* send to trash*/) => {
    const isDelete = type === "delete";
    const isAdd = type === "add";

    if (queryClient.getQueryData(allListsKey)) // for all lists page
        queryClient.setQueryData(allListsKey, (oldData: ListData[]) => {
            const allLists = isAdd ? oldData
                : oldData.filter((list) => list.id !== data.id); //remove the old list
            return isDelete
                ? allLists
                : [...allLists, data].sort((a, b) => a.title.localeCompare(b.title)); //sort based on title
        });

    if (queryClient.getQueryData(trashListsKey)) // for trash page
        queryClient.invalidateQueries({ queryKey: trashListsKey })

    queryClient.setQueryData(['list', data.id], data)
}