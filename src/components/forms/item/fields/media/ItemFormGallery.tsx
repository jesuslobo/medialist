import { useItemFormLayoutField } from "@/components/forms/item/ItemFormLayoutSection"
import { ItemFormContext, ItemFormCounterGen } from "@/components/forms/item/ItemFormProvider"
import MediaImageCard from "@/components/page/lists/[id]/[itemId]/fields/media/MediaImageCard"
import ToggleButton from "@/components/ui/buttons/ToggleButton"
import ImageInput from "@/components/ui/form/ImageUploader"
import { thumbnailName } from "@/utils/lib/fileHandling/thumbnailOptions"
import httpClient from "@/utils/lib/httpClient"
import { mutateMediaCache } from "@/utils/lib/tanquery/mediaQuery"
import { GalleryField, GalleryFieldFilter, ItemData } from "@/utils/types/item"
import { MediaData } from "@/utils/types/media"
import { Button, Card, Chip, Input, Textarea } from "@heroui/react"
import { useMutation } from "@tanstack/react-query"
import { Dispatch, SetStateAction, useContext, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { BiFilterAlt, BiImageAdd, BiLockOpenAlt, BiSave, BiSearch, BiSolidLockAlt, BiX } from "react-icons/bi"
import { ItemFormMedia } from "../../ItemFormProvider"

// it is stateless like tags field
export default function ItemFormGallery({
    rowIndex,
    colIndex
}: {
    rowIndex: number,
    colIndex: number
}) {
    const { list, media, activeTabFields, setActiveTabFields, item, itemForm } = useContext(ItemFormContext)
    const { setValue } = itemForm
    const { remove, set } = useItemFormLayoutField(rowIndex, colIndex, setActiveTabFields)
    const { filter } = activeTabFields[rowIndex][colIndex] as GalleryField & { id: number }

    const [searchValue, setSearchValue] = useState(filter?.keywords?.join(', ') || '')

    const isFilterLocked = Array.isArray(filter?.keywords) && filter?.keywords.length > 0
    const [lockFilters, _setLockFilters] = useState(Boolean(isFilterLocked))
    function setLockFilters(value: boolean | ((prev: boolean) => boolean)) {
        const newVal = typeof value === 'function' ? value(lockFilters) : value
        if (newVal && !searchValue) {
            set({ filter: undefined })
            return _setLockFilters(false)
        }

        _setLockFilters(value)
        const keywords = searchValue.split(',').map(key => key.trim())
        set({ filter: { ...filter, keywords: newVal ? keywords : [] } })
    }

    const filteredMedia = useMemo(() => {
        if (!searchValue) return media
        const keywords = searchValue.split(',').map(key => key.trim()) || []

        const baseKeywordsFilters = new Set<string>(keywords)
        return baseKeywordsFilters.size
            ? media.filter(item => item?.keywords?.some(key => baseKeywordsFilters.has(key)))
            : media
    }, [media, searchValue])

    const newMedia = itemForm.watch('media') as ItemFormMedia[] || []
    const setNewMedia = (data: SetMediaCallBack | ItemFormMedia[]) =>
        setValue('media', typeof data === 'function' ? data(newMedia) : data)

    const [showAddForm, setShowAddForm] = useState(false)
    const itemSrc = item && `/users/${list.userId}/${list.id}/${(item as ItemData).id}`

    const editMutation = useMutation({
        mutationFn: async (data: Pick<MediaData, 'keywords' | 'title' | 'id'>) =>
            await httpClient().patch(`media/${data.id}`, data),
        onSuccess: (data: MediaData) => mutateMediaCache(data, 'edit'),
    })

    const deleteMutation = useMutation({
        mutationFn: async (id?: string) => await httpClient().delete(`media/${id}`),
        onSuccess: (data: MediaData) => mutateMediaCache(data, 'delete'),
    })

    return (
        <article className="space-y-3">
            <div className="w-full flex gap-x-2 items-center">
                <ToggleButton
                    title="add new image"
                    isToggled={showAddForm}
                    setIsToggled={setShowAddForm}
                    onDragOver={() => setShowAddForm(true)}
                    isIconOnly
                >
                    <BiImageAdd className="ml-1 text-xl" />
                </ToggleButton>
                <Input
                    className="text-foreground shadow-none"
                    title="Add some keywords, Locking them means this gallery will highlight only those"
                    placeholder="Add some keywords, Locking them means this gallery will highlight only those"
                    startContent={<BiSearch className="opacity-80" size={20} />}
                    value={searchValue}
                    onValueChange={setSearchValue}
                    isDisabled={lockFilters}
                />
                <ToggleButton
                    title="lock filters (only for keywords)"
                    className="cursor-pointer"
                    toggledChildren={<BiSolidLockAlt className="text-xl" />}
                    isToggled={lockFilters}
                    setIsToggled={setLockFilters}
                    disabled={searchValue.length === 0}
                    isIconOnly
                >
                    <BiLockOpenAlt className="text-xl" />
                </ToggleButton>
                <Button
                    variant="light"
                    isIconOnly
                    onPress={remove}
                >
                    <BiX className="text-xl" />
                </Button>
            </div>

            {lockFilters && filter?.keywords &&
                <div className="flex flex-wrap gap-x-1 items-center justify-start ">
                    <Chip variant="bordered" size="sm" >
                        <BiFilterAlt className="text-lg" title="Applied Filters" />
                    </Chip>
                    {filter?.keywords.map((key, index) =>
                        <Chip key={'gallery-keyword' + index} variant="bordered" size="sm" >
                            {key}
                        </Chip>
                    )}
                </div>
            }

            <div className="w-full h-full columns-3xs gap-x-4 space-y-4">
                {showAddForm &&
                    <AddImageForm
                        setShowAddForm={setShowAddForm}
                        setNewMedia={setNewMedia}
                        filter={filter}
                    />
                }

                {newMedia.map((image, index) =>
                    <MediaImageCard
                        // react for some reason refuses to properly update this unless it has a new key every time
                        key={'new-gallery-image' + Date.now() + index}
                        title={image.title as string | undefined}
                        keywords={image.keywords}
                        src={URL.createObjectURL(image.path as File)}
                        thumbnailSrc={URL.createObjectURL(image.path as File)}
                        onEdit={(data) => setNewMedia(e =>
                            e.toSpliced(index, 1, { ...newMedia[index], title: data.title, keywords: data.keywords }))
                        }
                        onDelete={() => setNewMedia(e => e.filter((_, i) => i !== index))}
                    />
                )}

                {filteredMedia.map((image, index) =>
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

type SetMediaCallBack = ((prev: ItemFormMedia[]) => ItemFormMedia[])

interface AddImageForm { path: File, title?: string, keywords?: string }
function AddImageForm({
    setShowAddForm,
    setNewMedia,
    filter,
}: {
    setShowAddForm: Dispatch<SetStateAction<boolean>>,
    setNewMedia: (data: SetMediaCallBack | ItemFormMedia[]) => void
    filter?: GalleryFieldFilter
}) {
    const { handleSubmit, control, register, reset } = useForm<AddImageForm>({
        defaultValues: {
            keywords: filter?.keywords?.join(', ') || undefined
        }
    })

    function onSubmit(data: AddImageForm) {
        const newReq = {
            path: data.path,
            ref: String(ItemFormCounterGen.next().value),
            title: data.title,
            keywords: data.keywords?.split(',').map(key => key.trim()) || [],
        }
        setNewMedia(e => [newReq, ...e] as ItemFormMedia[])
        reset()
        setShowAddForm(false)
    }

    return (
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

            <Button
                className="w-full"
                onPress={() => handleSubmit(onSubmit)()}
            >
                <BiSave className="text-xl" />
                Add
            </Button>
        </Card>
    )
}

