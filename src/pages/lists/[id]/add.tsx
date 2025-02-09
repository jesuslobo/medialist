import ItemFormHeaderSection from "@/components/forms/item/ItemFormHeaderSection"
import ItemFormHeaderTitleBar from "@/components/forms/item/ItemFormHeaderTitleBar"
import ItemFormLayoutSection from "@/components/forms/item/ItemFormLayoutSection"
import ItemFormProvider, { ItemFormData, ItemFormField, ItemFormLayoutTab, ItemFormLogoField } from "@/components/forms/item/ItemFormProvider"
import ItemFormLayoutTitleBar from "@/components/forms/item/layoutTitleBar/ItemFormLayoutTitleBar"
import ErrorPage from "@/components/layouts/ErrorPage"
import ListsLoading from "@/components/layouts/loading/ListsLoading"
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import { generateID, validatedID } from "@/utils/lib/generateID"
import httpClient from "@/utils/lib/httpClient"
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery"
import { singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery"
import { mutateTagCache, tagsQueryOptions } from "@/utils/lib/tanquery/tagsQuery"
import { ItemSaveResponse } from "@/utils/types/item"
import { ListData } from "@/utils/types/list"
import { useMutation, useQuery } from "@tanstack/react-query"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
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
            tags: [],
        }
    })
    const { handleSubmit } = itemForm

    const { data: list, isSuccess, isPending } = useQuery(singleListQueryOptions(listId))
    const tags = useQuery(tagsQueryOptions(listId))

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().post(`lists/${listId}/items`, formData),
        onSuccess: ({ item, newTags }: ItemSaveResponse) => {
            mutateItemCache(item, "add")
            newTags?.forEach(tag => mutateTagCache(tag, "add"))

            router.push(`/lists/${listId}/${item.id}`)
        },
    })

    const [layoutTabs, setLayoutTabs] = useState<ItemFormLayoutTab[]>([])
    const [activeTabIndex, setActiveTabIndex] = useState(0)


    function onSubmit(data: ItemFormData) {
        const formData = new FormData()

        const logoFieldsTypes = ["badge", "link"]

        let layout = layoutTabs.map((tab) =>
            tab.map((row, rowIndex) =>
                rowIndex === 0
                    ? row //header
                    : (row as ItemFormField[]).map((field) => {
                        if (logoFieldsTypes.includes(field.type)) {
                            const id = generateID(10)
                            const fieldT = field as ItemFormLogoField
                            if (fieldT?.logoPath)
                                formData.append(`logoPaths[${id}]`, fieldT.logoPath as File)

                            return { ...field, logoPath: fieldT?.logoPath && id, id: undefined }
                        } else {
                            return { ...field, id: undefined, }
                        }
                    })
            )
        )

        //Header
        formData.append('header', JSON.stringify(data.header))
        formData.append('title', data.title)
        formData.append('description', data.description as string)
        if (data.cover) formData.append('cover', data.cover as File)
        if (data.poster) formData.append('poster', data.poster as File)

        //Layout
        formData.append('layout', JSON.stringify(layout))
        formData.append('tags', JSON.stringify(data.tags))

        if (data.media) {
            const media = data.media.map(media => {
                const key = generateID(10)
                formData.append(`mediaImages[${key}]`, media.path as File)
                return {
                    title: media.title,
                    keywords: media.keywords,
                    path: key
                }
            })
            formData.append('media', JSON.stringify(media))
        }

        mutation.mutate(formData)
    }

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
