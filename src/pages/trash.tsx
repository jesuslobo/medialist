import ErrorPage from "@/components/layouts/ErrorPage";
import ListsLoading from "@/components/layouts/loading/ListsLoading";
import TrashCardCheckBox from "@/components/page/trash/TrashCardCheckBox";
import TitleBar from "@/components/ui/bars/TitleBar";
import StatusSubmitButton, { StatusSubmitButtonProps } from "@/components/ui/buttons/StatusSubmitButton";
import ToggleButton from "@/components/ui/buttons/ToggleButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery";
import { mutateListCache } from "@/utils/lib/tanquery/listsQuery";
import { simpleToast } from "@/utils/toast";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { addToast, Button, CheckboxGroup, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import { BiCheckCircle, BiCheckDouble, BiRevision, BiSearch, BiSolidCheckCircle, BiTrashAlt } from "react-icons/bi";

interface DeleteEntity {
    id: string;
    listId: string | null; // listId of items, so its null for lists
    title: string;
    coverPath: string | null;  // coverPath for lists, posterPath for items
    updatedAt: Date;
}

export default function TrashPage() {
    const trashData = useQuery<DeleteEntity[]>({
        queryKey: ['trash'],
        queryFn: () => httpClient().get('trash')
    })

    const deleteMutation = useMutation({
        mutationFn: (data: ServerData) => httpClient().delete('trash', data),
        onError: () => addToast(simpleToast('Failed To Clear The Trash', 'danger')),
        onSuccess: () => {
            trashData.refetch()
            setSelected([])
            addToast(simpleToast('Trash Cleared'))
            deleteMutation.reset()
        },
    })

    const restoreMutation = useMutation({
        mutationFn: (data: ServerData) => httpClient().patch('trash', data),
        onSuccess: (data: { items: ItemData[], lists: ListData[] }) => {
            data.items.forEach(item => mutateItemCache(item, "add"))
            data.lists.forEach(list => mutateListCache(list, "add"))
            trashData.refetch()
            setSelected([])
            restoreMutation.reset()
        },
    })

    const [selected, setSelected] = useState<string[]>([]);
    const selectedIDs = extractIDs(selected)
    const isAllSlected = trashData.data ? selected.length === trashData.data.length : false

    const [visibleEntities, setVisibleEntities] = useState<DeleteEntity[]>([])
    const [allow, _setAllow] = useState<'items' | 'lists' | null>(null) // null means both
    const [searchValue, _setSearchValue] = useState<string>('')

    const setSearchValue = (value: string) => _setSearchValue(value.toLowerCase().trim())
    const setAllow = (value: 'items' | 'lists') => _setAllow(value === allow ? null : value)

    const isUnderFilter = (entity: DeleteEntity) => {
        console.log(entity, allow === 'items' && entity.listId)
        if (allow === 'items' && !entity.listId) return false
        if (allow === 'lists' && entity.listId) return false
        if (searchValue && !entity.title.toLowerCase().includes(searchValue)) return false
        return true
    }

    useEffect(() => {
        if (!searchValue && !allow) return setVisibleEntities(trashData.data || [])
        setVisibleEntities(trashData.data!.filter(isUnderFilter))
    }, [trashData.data, allow, searchValue])

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    function selectAll() {
        if (isAllSlected) return setSelected([])
        setSelected([...trashData.data!.map(item => item.listId ? `i-${item.id}` : item.id)])
    }

    if (trashData.isLoading) return <ListsLoading />
    if (!trashData.isSuccess) return <ErrorPage message="Failed To Fetch The Data" />

    const actionButtonProps: Partial<StatusSubmitButtonProps> = {
        size: "sm",
        savedContent: <BiCheckDouble className="text-xl" />,
        errorContent: <BiRevision className="text-xl" />,
        isDisabled: selected.length === 0,
        isIconOnly: true
    }

    return (
        <>
            <Head>
                <title>Medialist - TrashPage</title>
            </Head>
            <TitleBar
                title="Trash"
                startContent={<BiTrashAlt className="text-3xl mr-3 flex-none p-0" />}
                className="p-5"
            >
                <Input
                    className="text-foreground shadow-none"
                    radius="lg"
                    placeholder="Type to search..."
                    startContent={<BiSearch className="opacity-80" size={20} />}
                    onValueChange={setSearchValue}
                    value={searchValue}
                />
            </TitleBar>

            <div className="flex items-center gap-2 mt-2 mb-5 animate-fade-in">
                <span className="text-foreground-500 capitalize">filter:</span>
                <ToggleButton
                    size="sm"
                    isToggled={allow === 'items'}
                    onPress={() => setAllow('items')}
                >
                    Items
                </ToggleButton>
                <ToggleButton
                    size="sm"
                    activeColor="secondary"
                    isToggled={allow === 'lists'}
                    onPress={() => setAllow('lists')}
                >
                    Lists
                </ToggleButton>
                <div className="flex-grow"></div>
                <StatusSubmitButton
                    {...actionButtonProps}
                    title="Delete All"
                    mutation={deleteMutation}
                    onPress={onOpen}
                    defaultContent={<BiTrashAlt className="text-xl" />}
                />
                <StatusSubmitButton
                    {...actionButtonProps}
                    title="Restore"
                    mutation={restoreMutation}
                    onPress={() => restoreMutation.mutate(selectedIDs)}
                    defaultContent={<BiRevision className="text-xl" />}
                />

                <ToggleButton
                    title="Select All"
                    size="sm"
                    isToggled={isAllSlected}
                    onPress={selectAll}
                    toggledChildren={<BiSolidCheckCircle className="text-xl" />}
                    isIconOnly
                >
                    <BiCheckCircle className="text-xl" />
                </ToggleButton>
            </div>

            <CheckboxGroup value={selected} onChange={setSelected}>
                <main className="grid grid-cols-3 lg:grid-cols-2 xs:flex xs:flex-col gap-3 items-start">
                    {visibleEntities.map((item, i) => <TrashCardCheckBox key={item.id + i} data={item} />)}
                </main>
            </CheckboxGroup>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <DeleteModal onPress={() => deleteMutation.mutate(selectedIDs)} />
            </Modal>
        </>
    )
}

interface ServerData {
    items: string[]
    lists: string[]
}

function extractIDs(IDs: string[]) {
    let result = {
        items: [],
        lists: []
    } as ServerData

    IDs.forEach(id => {
        if (id.startsWith('i-')) result.items.push(id.replace('i-', ''))
        else result.lists.push(id)
    })

    return result
}

function DeleteModal({ onPress }: { onPress: () => void }) {
    return (
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">Are You Sure?</ModalHeader>
                    <ModalBody>
                        <p>Deleting this is <b>permanent</b> and <b>cannot be undone.</b></p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            variant="bordered"
                            onPress={() => {
                                onPress()
                                onClose()
                            }}
                        >
                            Delete Permanently
                        </Button>
                        <Button color="primary" onPress={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    )
}