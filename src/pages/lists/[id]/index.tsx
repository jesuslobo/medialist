import ErrorPage from "@/components/layouts/ErrorPage"
import ListsLoading from "@/components/layouts/loading/ListsLoading"
import ListPageItems from "@/components/page/lists/[id]/ListPageItems"
import ListPageProvider from "@/components/page/lists/[id]/ListPageProvider"
import ListPageSubNavBar from "@/components/page/lists/[id]/ListPageSubNavBar"
import TitleBar from "@/components/ui/bars/TitleBar"
import { validatedID } from "@/utils/lib/generateID"
import { itemsQueryOptions, setupItemsCache } from "@/utils/lib/tanquery/itemsQuery"
import { singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery"
import { ListData } from "@/utils/types/list"
import { useQuery } from "@tanstack/react-query"
import Head from "next/head"
import { useRouter } from "next/router"
import { BiCollection } from "react-icons/bi"

function ListPage() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']

    const { data: list, isSuccess, isPending } = useQuery(singleListQueryOptions(listId))
    const items = useQuery(itemsQueryOptions(listId))

    const numberOfItems = 0 // for now

    if (isPending || items.isPending) return <ListsLoading />
    if (!isSuccess || !items.isSuccess) return <ErrorPage message="Failed To Fetch The List" />

    setupItemsCache(items.data)

    return (
        <>
            <Head>
                <title>MediaList - {list.title}</title>
            </Head>

            <ListPageProvider list={list} items={items.data}>
                <TitleBar
                    title={`${list.title} (${numberOfItems})`}
                    className="mb-0 p-5"
                    startContent={<BiCollection className="text-3xl mr-3 flex-none p-0" />}
                    pointedBg
                >
                </TitleBar>

                <ListPageSubNavBar />

                <ListPageItems />
            </ListPageProvider>
        </>
    )
}

export default function ListPageHOC() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']
    return validatedID(listId)
        ? <ListPage />
        : <ErrorPage message="Bad List ID, Page Doesn't Exist" MainMessage="404!" hideTryAgain />
}