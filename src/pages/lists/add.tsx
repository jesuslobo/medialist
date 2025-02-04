import ListFormHeader from "@/components/forms/list/ListFormHeader";
import ListFormProvider, { ListFormData } from "@/components/forms/list/ListFormProvider";
import TitleBar from "@/components/ui/bars/TitleBar";
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateListCache } from "@/utils/lib/tanquery/listsQuery";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";

export default function AddListPage() {
    const router = useRouter()

    const listForm = useForm<ListFormData>()
    const { handleSubmit } = listForm

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().post('lists', formData),
        onSuccess: (data) => {
            mutateListCache(data, "add")
            router.push(`/lists/${data.id}`)
        },
    })

    function onSubmit(data: ListFormData) {
        const formData = new FormData()

        formData.append('title', data.title)
        formData.append('cover', data.cover as File)
        mutation.mutate(formData)
    }

    return (
        <ListFormProvider listForm={listForm}>
            <Head>
                <title>MediaList - Add List</title>
            </Head>

            <TitleBar
                title="Add List"
                startContent={<BiPlus className="text-3xl mr-3 flex-none " />}
            >
                <StatusSubmitButton
                    mutation={mutation}
                    onPress={handleSubmit(onSubmit)}
                />
            </TitleBar>

            <form className="animate-fade-in grid-cols-1 grid text-foreground" onSubmit={e => e.preventDefault()}>
                <ListFormHeader />
            </form>
        </ListFormProvider>
    )
}