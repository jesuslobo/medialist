import ImageInput from "@/components/ui/form/ImageUploader";
import { Input } from "@nextui-org/react";
import { useContext } from "react";
import { Controller } from "react-hook-form";
import { ListFormContext } from "./ListFormProvider";

export default function ListFormHeader() {
    const { listForm } = useContext(ListFormContext)
    const { control } = listForm

    return (
        <header className="grid grid-cols-4 md:grid-cols-1 gap-5 ">
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
        </header>
    )

};