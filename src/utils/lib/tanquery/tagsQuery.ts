import { queryClient } from '@/components/providers/RootProviders';
import { TagData } from '@/utils/types/global';
import { queryOptions } from '@tanstack/react-query'
import httpClient from '../httpClient';

/** All Tags of A List
 * @example Key: ['tags', listId]
*/
export const tagsQueryOptions = (listId: string) => queryOptions<TagData[]>({
    queryKey: ['tags', listId],
    queryFn: async () => await httpClient().get(`lists/${listId}/tags`),
})

/** - Edit All Tags Cache */
export const mutateTagCache = (data: TagData, type: "edit" | "add" | "delete") => {
    const isDelete = type === "delete";
    const isAdd = type === "add";
    const tagsKey = ['tags', data.listId];

    queryClient.setQueryData(tagsKey, (oldData: TagData[]) => {
        const allTags = isAdd ? oldData
            : oldData.filter((tag) => tag.id !== data.id); //remove the old image
        return isDelete ? allTags : [...allTags, data];
    });
};