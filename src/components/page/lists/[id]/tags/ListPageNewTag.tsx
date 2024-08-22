import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import { TagGroup } from "@/utils/functions/sortTagsByGroup"
import httpClient from "@/utils/lib/httpClient"
import { mutateTagCache } from "@/utils/lib/tanquery/tagsQuery"
import { TagData } from "@/utils/types/global"
import { Autocomplete, AutocompleteItem, Button, ButtonGroup, Divider, Input } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { BiPlus, BiX } from "react-icons/bi"
import { ListPageContext } from "../ListPageProvider"

type TagForm = Omit<TagData, 'id' | 'userId' | 'listId'>

export default function ListPageNewTag({
    tagsGroups
}: {
    tagsGroups: TagGroup[]
}) {
    const { list } = useContext(ListPageContext)
    const [showForm, setShowForm] = useState(false)

    const { handleSubmit, register, reset } = useForm<TagForm>()

    const mutation = useMutation({
        mutationFn: (data: TagForm) => httpClient().post(`lists/${list.id}/tags`, data),
        onSuccess: (data: TagData) => {
            mutateTagCache(data, 'add')
            reset()
            mutation.reset()
            setShowForm(false)
        }
    })

    function onSubmit(data: TagForm) {
        mutation.mutate(data)
    }

    return (
        <AnimatePresence>
            {showForm
                ? <motion.div
                    key="newTag-form"
                    className="overflow-hidden"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                >
                    <form className="grid gap-y-2" onSubmit={e => e.preventDefault()}>
                        <Divider />

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
                                mutation={mutation}
                                defaultContent={<> Add Tag <BiPlus size={20} /></>}
                                onPress={handleSubmit(onSubmit)}
                            />
                            <Button onPress={() => setShowForm(false)} className=" rounded-l-sm" isIconOnly>
                                <BiX size={20} />
                            </Button>
                        </ButtonGroup>

                        <Divider />
                    </form>
                </motion.div>
                :
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 100 }}
                >
                    <Button
                        key="newTag-button"
                        size="sm"
                        className="bg-default bg-opacity-40 text-foreground w-full"
                        onClick={() => setShowForm(true)}
                    >
                        <BiPlus size={20} />
                    </Button>
                </motion.div>
            }
        </AnimatePresence>
    )

}