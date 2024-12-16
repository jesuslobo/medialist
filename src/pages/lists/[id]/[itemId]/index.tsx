import ErrorPage from "@/components/layouts/ErrorPage"
import ItemPageHeader from "@/components/page/lists/[id]/[itemId]/Header"
import ItemPageLayout from "@/components/page/lists/[id]/[itemId]/ItemPageLayout"
import { ItemPageProvider } from "@/components/page/lists/[id]/[itemId]/ItemPageProvider"
import { validatedID } from "@/utils/lib/generateID"
import { itemQueryOptions } from "@/utils/lib/tanquery/itemsQuery"
import { tagsQueryOptions } from "@/utils/lib/tanquery/tagsQuery"
import { ItemData } from "@/utils/types/item"
import { ListData } from "@/utils/types/list"
import { Spinner } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import Head from "next/head"
import { useRouter } from "next/router"

function ItemPage() {
    const router = useRouter()
    const itemId = router.query.itemId as ItemData['id']
    const listId = router.query.id as ListData['id']

    const { data: item, isPending, isSuccess } = useQuery(itemQueryOptions(itemId))
    const allTags = useQuery(tagsQueryOptions(listId))

    if (isPending || allTags.isPending) return (
        <div className="flex justify-center items-center">
            <Spinner />
        </div >)
    if (!isSuccess || !allTags.isSuccess) return <ErrorPage message="Failed To Fetch The Item" />

    const itemTags = allTags.data.filter(tag => item.tags.includes(tag.id))

    return (
        <ItemPageProvider item={item} tags={itemTags}>
            <Head>
                <title>MediaList - {item.title}</title>
            </Head>
            <ItemPageHeader />
            <ItemPageLayout />
        </ItemPageProvider>
    )
}

export default function ItemPageHOC() {
    const router = useRouter()
    const itemId = router.query.itemId as ItemData['id']
    const listId = router.query.id as ListData['id']

    return validatedID(listId) && validatedID(itemId)
        ? <ItemPage />
        : <ErrorPage message="Bad Item ID, Page Doesn't Exist" MainMessage="404!" hideTryAgain />
}