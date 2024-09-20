import ItemFormLayoutSection from "@/components/forms/item/ItemFormLayoutSection"
import ItemFormProvider, { ItemFormData, ItemFormField } from "@/components/forms/item/ItemFormProvider"
import ErrorPage from "@/components/layouts/ErrorPage"
import ListsLoading from "@/components/layouts/loading/ListsLoading"
import TitleBar from "@/components/ui/bars/TitleBar"
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import { validatedID } from "@/utils/lib/generateID"
import { singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery"
import { ListData } from "@/utils/types/list"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

function AddItemPage() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']

    const itemForm = useForm<ItemFormData>()
    const { handleSubmit, control, formState: { errors }, register } = itemForm

    const { data: list, isSuccess, isPending } = useQuery(singleListQueryOptions(listId))

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
        console.log({ data, containers })
        const formData = new FormData()

        formData.append('title', data.title)
        formData.append('cover', data.cover as File)
        formData.append('poster', data.poster as File)
        mutation.mutate(formData)
    }

    const [containers, setContainers] = useState<ItemFormField[][]>([])

    useEffect(() => {
        setContainers([
            [{ id: "1", type: "link" }, { id: "2", type: "labelText" }, { id: "3", type: "labelText" }],
            [{ id: "4", type: "labelText" }, { id: "5", type: "labelText" }, { id: "6", type: "labelText" }],
        ])
    }, [list])

    if (isPending) return <ListsLoading />
    if (!isSuccess) return <ErrorPage message="Failed To Fetch The List" />

    return (
        <ItemFormProvider
            list={list}
            itemForm={itemForm}
            containers={containers} // maybe move them to ItemFormLayoutSection
            setContainers={setContainers}
        >
            <h1>Add Item Page</h1>
            <StatusSubmitButton
                mutation={mutation}
                onPress={handleSubmit(onSubmit)}
            />

            <TitleBar
                className="bg-accented py-3 px-5 my-3"
                title="Layout"
            >

            </TitleBar>

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
