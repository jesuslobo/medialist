import { queryClient } from '@/components/providers/RootProviders';
import { TagData } from '@/utils/types/global';
import { queryOptions } from '@tanstack/react-query';
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

    if (!queryClient.getQueryData(tagsKey)) return // no cache to update

    queryClient.setQueryData(tagsKey, (oldData: TagData[]) => {
        let newData = [...oldData];
        const index = type !== 'add' && oldData.findIndex((tag) => tag.id === data.id);

        switch (type) {
            case 'add':
                return [...oldData, data].sort((a, b) => a.label.localeCompare(b.label));
            case 'delete':
                newData.splice(index as number, 1);
                return newData;
            case 'edit':
                newData[index as number] = data
                newData.sort((a, b) => a.label.localeCompare(b.label));
                return newData;
        }
    });
};