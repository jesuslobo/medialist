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
    const tagsKey = ['tags', data.listId];

    queryClient.setQueryData(tagsKey, (oldData: TagData[]) => {
        switch (type) {
            case 'add':
                return [...oldData, data];
            case 'delete':
                return oldData.filter((tag) => tag.id !== data.id);
            case 'edit':
                return oldData.map((tag) => tag.id === data.id ? data : tag);
        }
    });
};