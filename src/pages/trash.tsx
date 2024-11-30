import ErrorPage from "@/components/layouts/ErrorPage";
import ListsLoading from "@/components/layouts/loading/ListsLoading";
import TrashCardCheckBox from "@/components/page/trash/TrashCardCheckBox";
import TitleBar from "@/components/ui/bars/TitleBar";
import ToggleButton from "@/components/ui/buttons/ToggleButton";
import httpClient from "@/utils/lib/httpClient";
import { ItemData } from "@/utils/types/item";
import { ListData } from "@/utils/types/list";
import { Button, CheckboxGroup } from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useState } from "react";
import { BiCheckCircle, BiGridAlt, BiRevision, BiSolidCheckCircle, BiTrashAlt } from "react-icons/bi";

export default function TrashPage() {
    const items = useQuery<ItemData[]>({
        queryKey: ['items', { trash: true }],
        queryFn: () => httpClient().get('items?trash=true')
    })

    const lists = useQuery<ListData[]>({
        queryKey: ['lists', { trash: true }],
        queryFn: () => httpClient().get('lists?trash=true')
    })

    const mutation = useMutation({
        mutationFn: (data) => new Promise((res) => res("success")),
        onSuccess: () => { },
    })

    const [selected, setSelected] = useState<string[]>([]);
    const selectedIDs = extractIDs(selected)
    const isAllSlected = items.data && lists.data ? selected.length === items.data.length + lists.data.length : false

    const [visibility, setVisibility] = useState<'items' | 'lists' | 'both'>('both') // what to show
    const isBothVisible = visibility === 'both'

    function selectAll() {
        if (isAllSlected) return setSelected([])

        const allItems = items.data?.map(item => 'item-' + item.id) || []
        const allLists = lists.data?.map(list => list.id) || []
        setSelected([...allItems, ...allLists])
    }

    function deleteSelected() {
        const { items: itemIDs, lists: listIDs } = selectedIDs

        // mutation.mutate({ itemIDs, listIDs })
    }

    if (items.isLoading || lists.isLoading) return <ListsLoading />
    if (!items.isSuccess || !lists.isSuccess) return <ErrorPage message="Failed To Fetch The Data" />

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
                    <Button isDisabled={selected.length === 0} title="Delete All" isIconOnly>
                        <BiTrashAlt className="text-xl" />
                    </Button>
                    <Button isDisabled={selected.length === 0} title="Restore" isIconOnly>
                        <BiRevision className="text-xl" />
                    </Button>
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
                    {lists.data?.map((list, i) => (visibility === "lists" || isBothVisible)
                        && <TrashCardCheckBox key={list.id + i} data={list} />
                    )}
                    {items.data?.map((item, i) => (visibility === "items" || isBothVisible)
                        && <TrashCardCheckBox key={item.id + i} data={item} isItem />
                    )}
                </main>
            </CheckboxGroup>
        </>
    )
}

function extractIDs(IDs: string[]) {
    let result = {
        items: [] as string[],
        lists: [] as string[]
    }

    IDs.forEach(id => {
        if (id.startsWith('item-')) result.items.push(id.replace('item-', ''))
        else result.lists.push
    })

    return result
}