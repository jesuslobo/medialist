import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import ToggleButton from "@/components/ui/buttons/ToggleButton"
import TrashPopoverButton from "@/components/ui/buttons/TrashPopoverButton"
import { TagGroup } from "@/utils/functions/sortTagsByGroup"
import httpClient from "@/utils/lib/httpClient"
import { mutateTagCache } from "@/utils/lib/tanquery/tagsQuery"
import { TagData } from "@/utils/types/global"
import { Autocomplete, AutocompleteItem, Button, ButtonGroup, Divider, Input } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { BiSave, BiSolidPencil, BiTrash } from "react-icons/bi"
import { ListPageContext } from "../ListPageProvider"

type TagForm = Omit<TagData, 'id' | 'userId' | 'listId'>

export default function ListPageTagsCard({
    tag,
    toggleTagQuery,
    tagsGroups
}: {
    tag: TagData,
    toggleTagQuery: (tag: TagData) => void
    tagsGroups: TagGroup[]

}) {
    const { tagsQuery } = useContext(ListPageContext)
    const [editMode, setEditMode] = useState(false)

    const { handleSubmit, register } = useForm<TagForm>({
        defaultValues: tag
    })

    const mutationEdit = useMutation({
        mutationFn: (data: TagForm) => httpClient().patch(`tags/${tag.id}`, data),
        onSuccess: (data: TagData) => {
            mutateTagCache(data, 'edit')
            toggleTagQuery(tag)
            toggleTagQuery(data)
            mutationEdit.reset()
            setEditMode(false)
        }
    })

    const mutationDelete = useMutation({
        mutationFn: () => httpClient().delete(`tags/${tag.id}`),
        onSuccess: (data: TagData) => {
            mutateTagCache(data, 'delete')
            setEditMode(false)
        }
    })

    function onSubmit(data: TagForm) {
        mutationEdit.mutate(data)
    }

    return (
        <>
            <ButtonGroup className="flex gap-x-1 animate-fade-in">
                <ToggleButton
                    isToggled={tagsQuery?.includes(tag.label)}
                    setIsToggled={() => toggleTagQuery(tag)}
                    className="justify-start py-2 px-5 min-w-60 duration-150 flex-grow rounded-r-sm"
                    title={tag.description}
                >
                    {tag.label}
                </ToggleButton>
                <ToggleButton
                    isToggled={editMode}
                    setIsToggled={() => setEditMode(prev => !prev)}
                    className="rounded-l-sm text-lg"
                    isIconOnly
                >
                    <BiSolidPencil />
                </ToggleButton>
            </ButtonGroup>

            <AnimatePresence>
                {editMode &&
                    <motion.div
                        key={tag.id + '-edit'}
                        className="overflow-hidden"
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                    >
                        <form className="grid gap-y-2" onSubmit={e => e.preventDefault()}>
                            <Input
                                isRequired
                                size="sm"
                                type="text"
                                placeholder="label"
                                {...register('label', { required: true })}
                            />
                            <Input
                                size="sm"
                                type="text"
                                placeholder="description"
                                {...register('description')}
                            />

                            <Autocomplete
                                aria-label="Group"
                                defaultItems={tagsGroups.filter((group) => group.groupName !== '')}
                                size="sm"
                                placeholder="Group"
                                allowsCustomValue
                                {...register("groupName")}
                            >
                                {(group) => (
                                    <AutocompleteItem key={String(group.groupName)} >
                                        {group.groupName}
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>

                            <ButtonGroup className="flex gap-x-1">
                                <StatusSubmitButton
                                    className="text-foreground flex-grow  rounded-r-sm"
                                    mutation={mutationEdit}
                                    defaultContent={<><BiSave size={20} /> Save Changes</>}
                                    onPress={handleSubmit(onSubmit)}
                                />
                                <TrashPopoverButton onPress={() => mutationDelete.mutate()} >
                                    {({ isTrashOpen }) =>
                                        <Button
                                            color={isTrashOpen ? 'danger' : 'default'}
                                            className=" rounded-l-sm"
                                            isLoading={mutationDelete.isPending}
                                            isIconOnly
                                        >
                                            <BiTrash size={20} />
                                        </Button>}
                                </TrashPopoverButton>
                            </ButtonGroup>

                            <Divider />
                        </form>
                    </motion.div>
                }
            </AnimatePresence>
        </>
    )
}