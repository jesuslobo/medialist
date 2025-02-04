import ImageInput from "@/components/ui/form/ImageUploader";
import { Button, Input } from "@heroui/react";
import { useContext } from "react";
import { Controller, FieldPath } from "react-hook-form";
import { BiRevision } from "react-icons/bi";
import { ListFormContext, ListFormData } from "./ListFormProvider";

export default function ListFormHeader() {
    const { listForm } = useContext(ListFormContext)
    const { control } = listForm

    return (
        <section className="grid grid-cols-4 md:grid-cols-1 gap-5 ">
            <Controller
                control={control}
                name="cover"
                render={({ field, fieldState }) => (
                    <ImageInput className="aspect-square md:aspect-auto md:w-full md:h-44"
                        innerContent={fieldState.isDirty
                            ? <ResetButton field="cover" />
                            : "Drop Image or Click to Add Cover"
                        }
                        {...field}
                    />
                )}
            />

            <section className="col-span-3 md:col-span-1">

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
            </section>
        </section>
    )
}

const ResetButton = ({ field }: { field: FieldPath<ListFormData> }) => {
    const { listForm } = useContext(ListFormContext)
    const { resetField } = listForm
    return (
        <Button onPress={() => resetField(field)} size="lg" isIconOnly>
            <BiRevision size={30} />
        </Button>
    )
}