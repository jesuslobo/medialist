import ListFormHeader from "@/components/forms/list/ListFormHeader";
import ListFormProvider, { ListFormData } from "@/components/forms/list/ListFormProvider";
import ErrorPage from "@/components/layouts/ErrorPage";
import ListsLoading from "@/components/layouts/loading/ListsLoading";
import TitleBar from "@/components/ui/bars/TitleBar";
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import { validatedID } from "@/utils/lib/generateID";
import httpClient from "@/utils/lib/httpClient";
import { mutateListCache, singleListQueryOptions } from "@/utils/lib/tanquery/listsQuery";
import { ListData } from "@/utils/types/list";
import { useMutation, useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { BiCheckDouble, BiPlus, BiRevision } from "react-icons/bi";
import { FaSave } from "react-icons/fa";

function EditListPage() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']

    const { data: list, isSuccess, isPending } = useQuery(singleListQueryOptions(listId))

    const listForm = useForm<ListFormData>()
    const { handleSubmit, formState: { dirtyFields } } = listForm

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().patch(`lists/${listId}`, formData),
        onSuccess: (data: ListData) => {
            mutateListCache(data, "edit")
            router.push(`/lists/${data.id}`)
        },
    })

    if (isPending) return <ListsLoading />
    if (!isSuccess) return <ErrorPage message="List Not Found" MainMessage="404!" hideTryAgain />

    function onSubmit(data: ListFormData) {
        if (!Object.keys(dirtyFields).length) return

        const formData = new FormData()
        if (dirtyFields.title)
            formData.append('title', data.title)
        if (dirtyFields.cover)
            formData.append('cover', data.cover as File | string)

        mutation.mutate(formData)
    }

    return (
        <ListFormProvider listForm={listForm} list={list}>
            <Head>
                <title>MediaList - Edit: {list.title}</title>
            </Head>

            <TitleBar
                title={`Edit: ${list.title}`}
                startContent={<BiPlus className="text-3xl mr-3 flex-none " />}
            >
                <StatusSubmitButton
                    className={!Object.keys(dirtyFields).length ? "cursor-not-allowed" : undefined}
                    title={!Object.keys(dirtyFields).length ? "No changes were made" : undefined}
                    mutation={mutation}
                    onPress={handleSubmit(onSubmit)}
                    defaultContent={<FaSave className="text-xl" />}
                    savedContent={<BiCheckDouble className="text-xl" />}
                    errorContent={<BiRevision className="text-xl" />}
                    disabled={!Object.keys(dirtyFields).length}
                    isIconOnly
                />
            </TitleBar>

            <form className="animate-fade-in grid-cols-1 grid text-foreground" onSubmit={e => e.preventDefault()}>
                <ListFormHeader />
            </form>
        </ListFormProvider>
    )
}

export default function EditListPageHOC() {
    const router = useRouter()
    const listId = router.query.id as ListData['id']
    return validatedID(listId)
        ? <EditListPage />
        : <ErrorPage message="Bad List ID, Page Doesn't Exist" MainMessage="404!" hideTryAgain />
}
