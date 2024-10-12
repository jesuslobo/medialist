import ImageInput from "@/components/ui/form/ImageUploader";
import { Input, Textarea } from "@nextui-org/react";
import { useContext } from "react";
import { Controller } from "react-hook-form";
import { ItemFormContext } from "./ItemFormProvider";

export default function ItemFormHeaderSection() {
    const { itemForm } = useContext(ItemFormContext)
    const { control, register } = itemForm
    return (
        <div className=" grid grid-cols-3 gap-x-3">
            <div className="p-2 space-y-3 bg-accented bg-opacity-50 rounded-xl">
                <Controller
                    control={control}
                    name="poster"
                    render={({ field }) => (
                        <ImageInput
                            className="h-44"
                            innerContent="Drop Image or Click to Add Poster"
                            {...field}
                        />
                    )}
                />
                <Input
                    variant="bordered"
                    placeholder="Title"
                    isRequired
                    {...register("title", { required: true })}
                />
            </div>
            <div className="p-2 space-y-3 bg-accented bg-opacity-50 rounded-xl col-span-2">
                <Controller
                    control={control}
                    name="cover"
                    render={({ field }) => (
                        <ImageInput
                            className="h-44"
                            innerContent="Drop Image or Click to Add Cover"
                            {...field}
                        />
                    )}
                />
                <Textarea
                    variant="bordered"
                    placeholder="Description"
                    {...register("description")}
                />
            </div>
        </div>
    )
}