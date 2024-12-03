import ErrorPage from "@/components/layouts/ErrorPage";
import ListsLoading from "@/components/layouts/loading/ListsLoading";
import TrashCardCheckBox from "@/components/page/trash/TrashCardCheckBox";
import TitleBar from "@/components/ui/bars/TitleBar";
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import ToggleButton from "@/components/ui/buttons/ToggleButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery";
import { mutateListCache } from "@/utils/lib/tanquery/listsQuery";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { Button, CheckboxGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useState } from "react";
import { BiCheckCircle, BiCheckDouble, BiRevision, BiSolidCheckCircle, BiTrashAlt } from "react-icons/bi";

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
        onSuccess: refresh,
    })

    const restoreMutation = useMutation({
        mutationFn: (data: ServerData) => httpClient().patch('trash', data),
        onSuccess: (data: { items: ItemData[], lists: ListData[] }) => {
            data.items.forEach(item => mutateItemCache(item, "add"))
            data.lists.forEach(list => mutateListCache(list, "add"))
            refresh()
        },
    })

    const [selected, setSelected] = useState<string[]>([]);
    const selectedIDs = extractIDs(selected)
    const isAllSlected = trashData.data ? selected.length === trashData.data.length : false

    const [visibility, setVisibility] = useState<'items' | 'lists' | 'both'>('both') // what to show

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    function selectAll() {
        if (isAllSlected) return setSelected([])
        setSelected([...trashData.data!.map(item => item.id)])
    }

    function refresh() {
        trashData.refetch()
        setSelected([])
    }

    if (trashData.isLoading) return <ListsLoading />
    if (!trashData.isSuccess) return <ErrorPage message="Failed To Fetch The Data" />

    return (
        <>
            <Head>
                <title>Medialist - TrashPage</title>
            </Head>
            <TitleBar
                title="Trash"
                startContent={<BiTrashAlt className="text-3xl mr-3 flex-none p-0" />}
                className="bg-pure-theme p-5"
            >
                <div className=" flex items-center justify-center gap-x-2">
                    <StatusSubmitButton
                        title="Delete All"
                        mutation={deleteMutation}
                        onPress={onOpen}
                        defaultContent={<BiTrashAlt className="text-xl" />}
                        savedContent={<BiCheckDouble className="text-xl" />}
                        errorContent={<BiRevision className="text-xl" />}
                        isDisabled={selected.length === 0}
                        isIconOnly
                    />
                    <StatusSubmitButton
                        title="Restore"
                        mutation={restoreMutation}
                        onPress={() => restoreMutation.mutate(selectedIDs)}
                        defaultContent={<BiRevision className="text-xl" />}
                        savedContent={<BiCheckDouble className="text-xl" />}
                        errorContent={<BiRevision className="text-xl" />}
                        isDisabled={selected.length === 0}
                        isIconOnly
                    />

                    <ToggleButton
                        isToggled={isAllSlected}
                        toggledChildren={<BiSolidCheckCircle className="text-xl" />}
                        onPress={selectAll}
                        title="Select All"
                        isIconOnly
                    >
                        <BiCheckCircle className="text-xl" />
                    </ToggleButton>
                </div>
            </TitleBar>

            <div className="flex items-center gap-2 mt-2 mb-5 animate-fade-in">
                <span className="text-foreground-500 capitalize">filter:</span>
                <ToggleButton
                    size="sm"
                    isToggled={visibility === 'items'}
                    onPress={() => setVisibility(visibility === 'items' ? 'both' : 'items')}
                >
                    Items
                </ToggleButton>
                <ToggleButton
                    size="sm"
                    activeColor="secondary"
                    isToggled={visibility === 'lists'}
                    onPress={() => setVisibility(visibility === 'lists' ? 'both' : 'lists')}
                >
                    Lists
                </ToggleButton>
            </div>

            <CheckboxGroup value={selected} onChange={setSelected}>
                <main className="grid grid-cols-3 lg:grid-cols-2 sm:flex sm:flex-col gap-3 items-start">
                    {trashData.data?.map((item, i) =>
                        visibility === 'items' && !item.listId
                            ? null
                            : visibility === 'lists' && item.listId
                                ? null
                                : <TrashCardCheckBox key={item.id + i} data={item} />
                    )}
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
                        <Button color="danger" variant="bordered" onPress={onPress}>
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