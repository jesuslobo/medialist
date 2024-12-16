import ErrorPage from "@/components/layouts/ErrorPage"
import ListsLoading from "@/components/layouts/loading/ListsLoading"
import ListPageItems from "@/components/page/lists/[id]/ListPageItems"
import ListPageProvider from "@/components/page/lists/[id]/ListPageProvider"
import ListPageSearchBar from "@/components/page/lists/[id]/ListPageSearchBar"
import ListPageSubNavBar from "@/components/page/lists/[id]/ListPageSubNavBar"
import ListPageTagsList from "@/components/page/lists/[id]/tags/ListPageTagsList"
import TitleBar from "@/components/ui/bars/TitleBar"
import { validatedID } from "@/utils/lib/generateID"
import { itemsQueryOptions, setupItemsCache } from "@/utils/lib/tanquery/itemsQuery"
import { singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery"
import { tagsQueryOptions } from "@/utils/lib/tanquery/tagsQuery"
import { ListData } from "@/utils/types/list"
import { useQuery } from "@tanstack/react-query"
import Head from "next/head"
import { useRouter } from "next/router"
import { BiCollection } from "react-icons/bi"

function ListPage() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']

    const { data: list, isSuccess, isPending, ...listQuery } = useQuery(singleListQueryOptions(listId))
    const items = useQuery(itemsQueryOptions(listId))
    const tags = useQuery(tagsQueryOptions(listId))

    if (listQuery.error?.message == 'Not Found') return <Error404 />
    if (isPending || items.isPending || tags.isPending) return <ListsLoading />
    if (!isSuccess || !items.isSuccess || !tags.isSuccess) return <ErrorPage message="Failed To Fetch The List" />

    setupItemsCache(items.data)

    return (
        <>
            <Head>
                <title>MediaList - {list.title}</title>
            </Head>

            <ListPageProvider list={list} items={items.data} tags={tags.data}>
                <TitleBar
                    title={`${list.title} (${items.data.length})`}
                    className="mb-0 p-5 bg-pure-theme"
                    startContent={<BiCollection className="text-3xl mr-3 flex-none p-0" />}
                >
                    <ListPageSearchBar />
                </TitleBar>

                <ListPageSubNavBar />
                <div className="relative">
                    <ListPageTagsList />
                    <ListPageItems />
                </div>
            </ListPageProvider>
        </>
    )
}

export default function ListPageHOC() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']
    return validatedID(listId)
        ? <ListPage />
        : <Error404 />
}

const Error404 = () => <ErrorPage message="Bad List ID, List Doesn't Exist" MainMessage="404!" hideTryAgain />