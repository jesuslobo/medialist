import ToggleButton from "@/components/ui/buttons/ToggleButton"
import TrashPopoverButton from "@/components/ui/buttons/TrashPopoverButton"
import ImageViewerModal from "@/components/ui/modals/ImageViewerModal"
import { MediaData } from "@/utils/types/media"
import { Button, ButtonProps, Card, CardFooter, CardHeader, Image, Input, Textarea } from "@heroui/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { BiErrorCircle, BiPencil, BiSave, BiTrashAlt } from "react-icons/bi"
import { MdHideImage } from "react-icons/md"

type onEdit = (newData: Pick<MediaData, 'keywords' | 'title'>) => void
export default function MediaImageCard({
    src,
    thumbnailSrc,
    title,
    keywords,
    onDelete,
    onEdit,
}: {
    src: string,
    thumbnailSrc?: string,
    title?: string,
    keywords?: string[],
    onDelete: () => void,
    onEdit: onEdit
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [imageState, setImageState] = useState<'deleted' | 'loaded' | null>('loaded');
    const [isEditMode, setIsEditMode] = useState(false)

    const actionButtonProps: ButtonProps = {
        className: "text-md shadow-sm h-6 aspect-1 rounded-full",
        variant: "light",
        isIconOnly: true,
    }

    function onDeleteHandler() {
        onDelete()
        setImageState('deleted')
    }

    function onEditHandler(newData: Pick<MediaData, 'keywords' | 'title'>) {
        onEdit(newData)
        setIsEditMode(false)
    }

    if (imageState === 'deleted') return (
        <Card className=" flex items-center h-full w-full p-4 bg-accented/70 border-none rounded-2xl shadow-lg animate-fade-in">
            <MdHideImage className="text-2xl" /> Deleted
        </Card>
    )

    if (!imageState) return (
        <Card
            className=" flex items-center h-full w-full p-4 bg-accented/70 hover:bg-accented border-none rounded-2xl shadow-lg animate-fade-in"
            title="click to retry loading"
            onPress={() => setImageState('loaded')}
            isPressable
        >
            <BiErrorCircle className="text-2xl" /> Failed to load
        </Card>
    )

    return <>
        <Card
            className="group h-full w-full border-none rounded-2xl shadow-lg hover:scale-105 duration-200 cursor-pointer animate-fade-in"
            radius="lg"
            onMouseLeave={() => setIsEditMode(false)}
            isFooterBlurred
        >
            <CardHeader className="absolute flex gap-x-2 w-fit z-30 top-1 right-1 overflow-hidden p-1 border-1 bg-accented/35 before:bg-white/10
                         border-white/20 rounded-large before:rounded-xl shadow-small scale-0 group-hover:scale-100 duration-150 origin-center">
                <ToggleButton
                    {...actionButtonProps}
                    isToggled={isEditMode}
                    setIsToggled={setIsEditMode}
                >
                    <BiPencil />
                </ToggleButton>

                <TrashPopoverButton onPress={onDeleteHandler} >
                    {({ isTrashOpen }) =>
                        <Button color={isTrashOpen ? 'danger' : 'default'} {...actionButtonProps} >
                            <BiTrashAlt />
                        </Button>
                    }
                </TrashPopoverButton>
            </CardHeader>

            <Image
                className="w-full h-full object-cover"
                alt={title || src}
                src={thumbnailSrc || src}
                onClick={() => setIsOpen(true)}
                onError={() => setImageState(null)}
                title="click to view full image"
            />
            {isEditMode &&
                <EditModeForm title={title} keywords={keywords} onEdit={onEditHandler} />
            }

            {(title || keywords) && !isEditMode &&
                <CardFooter className="absolute w-fit z-10 bottom-1 grid py-1 px-2 mx-1 space-y-1 overflow-hidden scroll shadow-small border-1 before:bg-white/10 border-white/20 rounded-large before:rounded-xl">
                    {title &&
                        <p className="text-start text-tiny text-white/80 line-clamp-1 group-hover:line-clamp-none">
                            {title}
                        </p>}
                    {keywords &&
                        <div className="flex-wrap gap-1 justify-start hidden group-hover:flex">
                            {keywords.map((key, index) =>
                                <div className="text-xs bg-accented/40 px-1 rounded-xl" key={key + index} >
                                    {key}
                                </div>
                            )}
                        </div>}
                </CardFooter>
            }
        </Card>

        <ImageViewerModal
            imageSrc={src}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    </>
}

interface EditModeForm {
    title?: string
    keywords?: string
}

function EditModeForm({
    title,
    keywords,
    onEdit,
}: {
    title?: string,
    keywords?: string[],
    onEdit: onEdit
}) {
    const { handleSubmit, register } = useForm<EditModeForm>({
        defaultValues: {
            keywords: keywords?.join(', '),
            title: title || undefined,
        }
    })

    function onSubmit(data: EditModeForm) {
        const newData = {
            title: data.title,
            keywords: data.keywords?.split(',').map(key => key.trim()) || [],
        }
        onEdit(newData)
    }

    return (
        <div className="absolute z-10 top-0 left-0 w-full h-full p-3 flex items-center justify-center bg-accented/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <article
                className="grid items-center justify-center gap-2 gap-y-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(onSubmit)()}
            >
                <Input
                    className="pt-5"
                    size="sm"
                    label="Title"
                    title="Title"
                    labelPlacement="outside"
                    placeholder="Title..."
                    {...register('title')}
                />
                <Textarea
                    size="sm"
                    label="Keywords"
                    title="Keywords"
                    labelPlacement="outside"
                    placeholder="key1, key2, key3..."
                    {...register('keywords')}
                />
                <Button
                    className="w-full font-semibold"
                    type="submit"
                    onPress={() => handleSubmit(onSubmit)()}
                >
                    <BiSave className="text-xl" /> Save
                </Button>
            </article >
        </div >
    )
}