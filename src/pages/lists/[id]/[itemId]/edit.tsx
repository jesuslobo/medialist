import ItemFormHeaderSection from "@/components/forms/item/ItemFormHeaderSection"
import ItemFormHeaderTitleBar from "@/components/forms/item/ItemFormHeaderTitleBar"
import ItemFormLayoutSection from "@/components/forms/item/ItemFormLayoutSection"
import ItemFormProvider, { ItemFormData, ItemFormField, ItemFormLayoutTab, ItemFormLogoField } from "@/components/forms/item/ItemFormProvider"
import ItemFormLayoutTitleBar from "@/components/forms/item/layoutTitleBar/ItemFormLayoutTitleBar"
import ErrorPage from "@/components/layouts/ErrorPage"
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import { generateID, validatedID } from "@/utils/lib/generateID"
import httpClient from "@/utils/lib/httpClient"
import { itemQueryOptions, mutateItemCache } from "@/utils/lib/tanquery/itemsQuery"
import { singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery"
import { mutateTagCache, tagsQueryOptions } from "@/utils/lib/tanquery/tagsQuery"
import { ItemData, ItemSaveResponse } from "@/utils/types/item"
import { ListData } from "@/utils/types/list"
import { Button, Spinner } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { BiCheckDouble, BiRevision, BiX } from "react-icons/bi"
import { FaSave } from "react-icons/fa"

function EditItemPage() {
    const router = useRouter()
    const itemId = router.query.itemId as ItemData['id']
    const listId = router.query.id as ListData['id']

    const { data: item, isPending, isSuccess } = useQuery(itemQueryOptions(itemId))
    const list = useQuery(singleListQueryOptions(listId))
    const tags = useQuery(tagsQueryOptions(listId))

    const itemForm = useForm<ItemFormData>({})
    const { handleSubmit, formState: { dirtyFields } } = itemForm

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().patch(`items/${itemId}`, formData),
        onSuccess: ({ item, newTags }: ItemSaveResponse) => {
            mutateItemCache(item, "edit")
            newTags?.forEach(tag => mutateTagCache(tag, "add"))

            router.push(`/lists/${listId}/${item.id}`)
        },
    })

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
                            let logoPath = fieldT?.logoPath as string | File | null
                            if (fieldT.logoPath instanceof File) {
                                formData.append(`logoPaths[${id}]`, fieldT.logoPath as File)
                                logoPath = id
                            }

                            return { ...field, logoPath, id: undefined }
                        } else {
                            return { ...field, id: undefined, }
                        }
                    })
            )
        )

        if (dirtyFields.tags)
            formData.append('tags', JSON.stringify(data.tags))

        if (dirtyFields.layout)
            formData.append('layout', JSON.stringify(layoutTabs))

        //Header
        formData.append('header', JSON.stringify(data.header))

        if (dirtyFields.title)
            formData.append('title', data.title)
        if (dirtyFields.description)
            formData.append('description', data?.description || '')
        if (dirtyFields.cover) {
            formData.append('cover', data.cover as File | string)
        }

        if (dirtyFields.poster) {
            formData.append('poster', data.poster as File | string)
        }

        //Layout
        formData.append('layout', JSON.stringify(layout))
        // apply garbage collection of not existing old tags
        formData.append('tags', JSON.stringify(data.tags))

        mutation.mutate(formData)
    }

    const [layoutTabs, setLayoutTabs] = useState<ItemFormLayoutTab[]>([])
    const [activeTabIndex, setActiveTabIndex] = useState(0)

    if (isPending || tags.isPending || list.isPending) return (
        <div className="flex justify-center items-center">
            <Spinner />
        </div >)
    if (!isSuccess || !tags.isSuccess || !list.isSuccess || item.listId !== listId)
        return <ErrorPage message="Failed To Fetch The Item" />

    return (
        <ItemFormProvider
            item={item}
            tags={tags.data}
            list={list.data}
            itemForm={itemForm}
            layoutTabs={layoutTabs}
            setLayoutTabs={setLayoutTabs}
            activeTabIndex={activeTabIndex}
        >
            <Head>
                <title>MediaList - {item.title} - edit</title>
            </Head>
            <ItemFormHeaderTitleBar>
                <Button
                    onPress={() => router.push(`../../${listId}/${itemId}`)}
                    color="danger"
                    isIconOnly
                >
                    <BiX className="text-3xl" />
                </Button>
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

export default function EditItemPageHOC() {
    const router = useRouter()
    const itemId = router.query.itemId as ItemData['id']
    const listId = router.query.id as ListData['id']

    return validatedID(listId) && validatedID(itemId)
        ? <EditItemPage />
        : <ErrorPage message="Bad Item ID, Page Doesn't Exist" MainMessage="404!" hideTryAgain />
}