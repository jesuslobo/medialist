import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import ToggleButton from "@/components/ui/buttons/ToggleButton"
import ImageInput from "@/components/ui/form/ImageUploader"
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"
import httpClient from "@/utils/lib/httpClient"
import { mutateMediaCache } from "@/utils/lib/tanquery/mediaQuery"
import { GalleryField, GalleryFieldFilter } from "@/utils/types/item"
import { MediaData } from "@/utils/types/media"
import { Button, Card, Chip, Image, Input, Spinner, Textarea } from "@heroui/react"
import { useMutation } from "@tanstack/react-query"
import { Dispatch, SetStateAction, useContext, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { BiFilterAlt, BiImageAdd, BiSave, BiSearch, BiSolidLockAlt } from "react-icons/bi"
import { itemPageContext } from "../../ItemPageProvider"
import MediaImageCard from "./MediaImageCard"

export default function ItemPageGallery({ field }: { field?: GalleryField }) {
    const { item, media, imagePaths: { itemSrc } } = useContext(itemPageContext)

    const [showAddForm, setShowAddForm] = useState(false)
    const filterKeywords = field?.filter?.keywords || []

    const filteredMedia = useMemo(() => {
        const baseKeywordsFilters = new Set<string>(filterKeywords)
        return baseKeywordsFilters.size
            ? media.filter(item => item?.keywords?.some(key => baseKeywordsFilters.has(key)))
            : media
    }, [media, filterKeywords])

    const [visiableMedia, setVisiableMedia] = useState(filteredMedia)

    const editMutation = useMutation({
        mutationFn: async (data: Pick<MediaData, 'keywords' | 'title' | 'id'>) =>
            await httpClient().patch(`media/${data.id}`, data),
        onSuccess: (data: MediaData) => mutateMediaCache(data, 'edit'),
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await httpClient().delete(`media/${id}`),
        onSuccess: (data: MediaData) => mutateMediaCache(data, 'delete'),
    })

    function onSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        const value = (e.target as HTMLInputElement).value.trim().toLowerCase()
        if (!value) return setVisiableMedia(filteredMedia)

        setVisiableMedia(filteredMedia.filter(item =>
            item.title?.toLowerCase().includes(value) ||
            item.keywords?.some(key => key.toLowerCase() === value)
        ))
    }

    return (
        <article className="space-y-3">
            <div className="w-full flex gap-x-2 items-center">
                <ToggleButton
                    title="add new image"
                    isToggled={showAddForm}
                    setIsToggled={setShowAddForm}
                    isIconOnly
                >
                    <BiImageAdd className="ml-1 text-xl" />
                </ToggleButton>
                <Input
                    onKeyUp={onSearch}
                    placeholder="search by title or keyword..."
                    startContent={<BiSearch className="opacity-80" size={20} />}
                    className="text-foreground shadow-none"
                />
                {field?.filter?.keywords &&
                    <Button
                        title="This Gallery has locked filters"
                        color="primary"
                        isIconOnly
                    >
                        <BiSolidLockAlt className="text-xl" />
                    </Button>}
            </div>

            {field?.filter?.keywords &&
                <div className="flex flex-wrap gap-x-1 items-center justify-start ">
                    <Chip variant="bordered" size="sm" >
                        <BiFilterAlt className="text-lg" title="Applied Filters" />
                    </Chip>
                    {filterKeywords.map((key, index) =>
                        <Chip key={'gallery-keyword' + index} variant="bordered" size="sm" >
                            {key}
                        </Chip>
                    )}
                </div>
            }

            <div className="w-full h-full columns-2xs gap-x-4 space-y-4">
                {showAddForm && <AddImageForm itemId={item.id} setShowAddForm={setShowAddForm} />}
                {visiableMedia.map((image, index) =>
                    <MediaImageCard
                        key={'gallery-image' + index}
                        title={image.title as string | undefined}
                        keywords={image.keywords}
                        src={`${itemSrc}/${image.path}`}
                        thumbnailSrc={`${itemSrc}/${thumbnailName(image.path, { w: 700 })}`}
                        onEdit={(data) => editMutation.mutate({ ...data, id: image.id })}
                        onDelete={() => deleteMutation.mutate(image.id)}
                    />
                )}
            </div>
        </article>
    )
}


interface AddImageForm { path: File, title?: string, keywords?: string }
function AddImageForm({
    itemId,
    setShowAddForm,
    filter,
}: {
    itemId: string,
    setShowAddForm: Dispatch<SetStateAction<boolean>>,
    filter?: GalleryFieldFilter
}) {
    const { handleSubmit, control, register, reset } = useForm<AddImageForm>({
        defaultValues: {
            keywords: filter?.keywords?.join(', ') || undefined
        }
    })
    const [image, setImage] = useState<string | undefined>(undefined)

    const mutation = useMutation({
        mutationFn: async (data: FormData) => await httpClient().post(`items/${itemId}/media`, data),
        onMutate: (data: FormData) => setImage(URL.createObjectURL(data.get('path') as File)),
        onSuccess: (data: MediaData) => {
            mutateMediaCache(data, 'add')
            setShowAddForm(false)
            reset()
        }
    })

    function onSubmit(data: AddImageForm) {
        const formData = new FormData()

        formData.append('path', data.path)
        if (data.title)
            formData.append('title', data.title)
        if (data.keywords)
            formData.append('keywords', JSON.stringify([data?.keywords.split(',').map((key: string) => key.trim()) || []]))

        mutation.mutate(formData)
    }

    return !mutation.isPending ? (
        <Card
            className="h-full w-full p-3 grid gap-y-2 bg-accented/70 rounded-2xl shadow-lg animate-fade-in"
            radius="lg"
        >
            <Controller
                control={control}
                name="path"
                render={({ field }) => (
                    <ImageInput
                        className="w-full h-44 p-0"
                        {...field}
                    />
                )}
            />
            <Input
                size="sm"
                variant="bordered"
                label="Title"
                title="Title"
                labelPlacement="inside"
                {...register('title')}
            />
            <Textarea
                size="sm"
                variant="bordered"
                label="Keywords"
                title="Keywords"
                labelPlacement="inside"
                placeholder="key1, key2, key3..."
                {...register('keywords')}
            />

            <StatusSubmitButton
                className="w-full"
                mutation={mutation}
                onPress={() => handleSubmit(onSubmit)()}
            >
                <BiSave className="text-xl" />
                Add
            </StatusSubmitButton>
        </Card>
    ) : (
        <article className="relative w-full h-full" title="loading Image...">
            <Image
                className="w-full h-full object-cover opacity-50"
                alt="loading..."
                src={image}
            />
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-pure-theme/45">
                <Spinner className="text-xl" size="lg" />
            </div>
        </article>
    )
}