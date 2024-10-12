import ItemFormHeaderSection from "@/components/forms/item/ItemFormHeaderSection"
import ItemFormHeaderTitleBar from "@/components/forms/item/ItemFormHeaderTitleBar"
import ItemFormLayoutSection from "@/components/forms/item/ItemFormLayoutSection"
import ItemFormProvider, { ItemFormData, ItemFormLayoutTab } from "@/components/forms/item/ItemFormProvider"
import ItemFormLayoutTitleBar from "@/components/forms/item/layoutTitleBar/ItemFormLayoutTitleBar"
import ErrorPage from "@/components/layouts/ErrorPage"
import ListsLoading from "@/components/layouts/loading/ListsLoading"
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import { validatedID } from "@/utils/lib/generateID"
import { singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery"
import { tagsQueryOptions } from "@/utils/lib/tanquery/tagsQuery"
import { ListData } from "@/utils/types/list"
import { useMutation, useQuery } from "@tanstack/react-query"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BiCheckDouble, BiRevision } from "react-icons/bi"
import { FaSave } from "react-icons/fa"

function AddItemPage() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']

    const itemForm = useForm<ItemFormData>({
        defaultValues: {
            header: {
                type: "poster_beside",
            },
            tags: ["2X6zV9GmSj", "bl8BlAAZVb", "GX88y8M1hp"],
        }
    })
    const { handleSubmit, control, formState: { errors }, register } = itemForm

    const { data: list, isSuccess, isPending } = useQuery(singleListQueryOptions(listId))
    const tags = useQuery(tagsQueryOptions(listId))

    const mutation = useMutation({
        mutationFn: (formData: FormData) => new Promise((res, rej) => console.log(res(formData))),
        onSuccess: (data) => console.log(data),
        // mutationFn: (formData: FormData) => httpClient().post(`lists/${listId}/items`, formData),
        // onSuccess: (data) => {
        //     mutateItemCache(data, "add")
        //     router.push(`/lists/${data.id}`)
        // },
    })

    function onSubmit(data: ItemFormData) {
        console.log({ data, layoutTabs })
        const formData = new FormData()

        formData.append('title', data.title)
        formData.append('cover', data.cover as File)
        formData.append('poster', data.poster as File)
        mutation.mutate(formData)
    }

    const [layoutTabs, setLayoutTabs] = useState<ItemFormLayoutTab[]>([])
    const [activeTabIndex, setActiveTabIndex] = useState(0)

    // will be moved to the provider, so it will only be loaded when the list is loaded
    useEffect(() => {
        setLayoutTabs([
            [
                { type: "left_sidebar", label: "Main" },
                [{ id: "1", type: "tags" }],
                [],
            ] as any,
        ])
    }, [])

    if (isPending || tags.isPending) return <ListsLoading />
    if (!isSuccess || !tags.isSuccess) return <ErrorPage message="Failed To Fetch The List" />

    return (
        <ItemFormProvider
            tags={tags.data}
            list={list}
            itemForm={itemForm}
            layoutTabs={layoutTabs}
            setLayoutTabs={setLayoutTabs}
            activeTabIndex={activeTabIndex}
        >
            <Head>
                <title>MediaList - {list.title} - Add Item</title>
            </Head>
            <ItemFormHeaderTitleBar>
                <StatusSubmitButton
                    color="primary"
                    mutation={mutation}
                    onPress={handleSubmit(onSubmit)}
                    defaultContent={<FaSave className="text-xl" />}
                    savedContent={<BiCheckDouble className="text-xl" />}
                    errorContent={<BiRevision className="text-xl" />}
                    isIconOnly
                />
            </ItemFormHeaderTitleBar>
            <ItemFormHeaderSection />

            <ItemFormLayoutTitleBar
                layoutTabs={layoutTabs}
                setLayoutTabs={setLayoutTabs}
                activeTabIndex={activeTabIndex}
                setActiveTabIndex={setActiveTabIndex}
            />
            <ItemFormLayoutSection />
        </ItemFormProvider>
    )
}

export default function AddItemPageHOC() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']
    return validatedID(listId)
        ? <AddItemPage />
        : <ErrorPage message="Bad List ID, Page Doesn't Exist" MainMessage="404!" hideTryAgain />
}
