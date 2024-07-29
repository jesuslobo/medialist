import { queryClient } from "@/components/providers/RootProviders";
import { UserData } from "@/utils/types/global";
import { queryOptions } from "@tanstack/react-query";
import httpClient from "../httpClient";

/** User Data
 * Key: ['user']
*/
export const userQueryOptions = () => queryOptions<UserData>({
    queryKey: ['user'],
    queryFn: () => httpClient().get('users'),
    retry: 3,
})

/** Edit userData's Cache */
export const mutateUserCache = (data: Partial<UserData>) => {
    queryClient.setQueryData(['user'], (oldData: UserData) => ({ ...oldData, ...data }));
};