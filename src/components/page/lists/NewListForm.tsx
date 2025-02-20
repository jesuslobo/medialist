import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import ImageInput from "@/components/ui/form/ImageUploader";
import httpClient from "@/utils/lib/httpClient";
import { mutateListCache } from "@/utils/lib/tanquery/listsQuery";
import { ListData } from "@/utils/types/list";
import { Card, CardBody, CardFooter, Input } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { BiCheckDouble, BiImageAdd, BiPlus, BiRevision } from "react-icons/bi";

interface ListFormData extends Omit<ListData, "id" | "createdAt" | "updatedAt" | 'coverPath' | 'userId'> {
    cover: File | null | string
}

export default function NewListForm({
    setIsAddMode,
}: {
    setIsAddMode: Dispatch<SetStateAction<boolean>>
}) {
    const listForm = useForm<ListFormData>()
    const { handleSubmit, register, control, reset } = listForm

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().post('lists', formData),
        onSuccess: (data) => {
            mutateListCache(data, "add")
            reset()
            setIsAddMode(false)
        },
    })

    function onSubmit(data: ListFormData) {
        const formData = new FormData()
        formData.append('title', data.title)
        if (data.cover)
            formData.append('cover', data.cover)
        mutation.mutate(formData)
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') handleSubmit(onSubmit)()
    }

    return (
        <Card
            className=" group bg-transparent duration-200 scale-110 animate-fade-in"
            shadow="none"
        >
            <CardBody className="overflow-visible p-0 ">
                <Controller
                    control={control}
                    name="cover"
                    render={({ field }) => (
                        <ImageInput
                            className="w-full aspect-square border-default"
                            innerContent={<BiImageAdd className="text-4xl" />}
                            {...field}
                        />
                    )}
                />
            </CardBody>

            <CardFooter className="h-full w-full flex flex-row gap-x-1 items-start justify-center px-0 py-2">
                <Input
                    size="sm"
                    className="w-full"
                    title="List Title"
                    label=""
                    placeholder="List Name..."
                    onKeyDown={onKeyDown}
                    {...register("title", { required: true })}
                />

                <StatusSubmitButton
                    size="sm"
                    mutation={mutation}
                    onPress={() => handleSubmit(onSubmit)()}
                    defaultContent={<BiPlus className="text-xl" />}
                    savedContent={<BiCheckDouble className="text-xl" />}
                    errorContent={<BiRevision className="text-xl" />}
                    isIconOnly
                />
            </CardFooter>
        </Card>
    )
}