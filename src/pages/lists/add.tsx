import TitleBar from "@/components/ui/bars/TitleBar";
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import ImageInput from "@/components/ui/form/ImageUploader";
import httpClient from "@/utils/lib/httpClient";
import { mutateListCache } from "@/utils/lib/tanquery/listsQuery";
import { ListData } from "@/utils/types/list";
import { Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";

interface ListFormData extends Omit<ListData, "id" | "createdAt" | "updatedAt" | 'coverPath' | 'userId'> {
    cover: File | null
}

export default function AddListPage() {
    const router = useRouter()

    const { handleSubmit, control, formState: { errors } } = useForm<ListFormData>()

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().post('lists', formData),
        onSuccess: (data) => {
            mutateListCache(data, "add")
            router.push(`/lists/${data.id}`)
        },
    })

    function onSubmit(data: ListFormData) {
        console.log(data)
        const formData = new FormData()

        formData.append('title', data.title)
        formData.append('cover', data.cover as File)
        formData.append('hi', 'dddd')
        mutation.mutate(formData)
    }

    return (
        <>
            <Head>
                <title>MediaList - Add List</title>
            </Head>

            <TitleBar
                title="Add List"
                startContent={<BiPlus className="text-3xl mr-3 flex-none " />}
                pointedBg
            >
                <StatusSubmitButton
                    mutation={mutation}
                    onPress={handleSubmit(onSubmit)}
                />
            </TitleBar>

            <form className="animate-fade-in grid-cols-1 grid text-foreground" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-4 md:grid-cols-1 gap-5 ">
                    <Controller
                        control={control}
                        name="cover"
                        render={({ field }) => (
                            <ImageInput className="aspect-square md:aspect-auto md:w-full md:h-44" {...field} />
                        )}
                    />

                    <div className="col-span-3 md:col-span-1">

                        <Controller
                            control={control}
                            name="title"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    label="Title"
                                    type="text"
                                    size="lg"
                                    isRequired
                                    {...field}
                                />
                            )}
                        />
                    </div>
                </div>

            </form>
        </>
    )
}