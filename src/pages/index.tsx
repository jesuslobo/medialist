import ErrorPage from "@/components/layouts/ErrorPage";
import ListsLoading from "@/components/layouts/loading/ListsLoading";
import { queryClient } from "@/components/providers/RootProviders";
import TitleBar from "@/components/ui/bars/TitleBar";
import ListCard from "@/components/ui/cards/ListCard";
import { allListsKey, listsQueryOptions, setupListsCache } from "@/utils/lib/tanquery/listsQuery";
import { Button, ButtonGroup } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { BiCollection, BiPlus, BiRevision } from "react-icons/bi";

export default function ListsPage() {
  const router = useRouter();

  const { data: Lists, isPending, isError, isSuccess } = useQuery(listsQueryOptions())

  if (isPending) return <ListsLoading />
  if (isError || !isSuccess) return <ErrorPage message="Failed to Fetch Lists" />

  setupListsCache(Lists);

  return (
    <>
      <Head>
        <title>Lists</title>
      </Head>

      <TitleBar
        title="Lists"
        startContent={<BiCollection className="text-3xl mr-3 flex-none " />}
        pointedBg
      >
        <ButtonGroup>
          <Button
            className="bg-accented"
            onPress={() => queryClient.invalidateQueries({ queryKey: allListsKey })}
          >
            <BiRevision className="text-base" /> Refresh
          </Button>
          <Button
            className="bg-accented"
            onPress={() => router.push('lists/add')}
          >
            <BiPlus className="text-base" /> Add
          </Button>
        </ButtonGroup>
      </TitleBar>

      <main className="grid grid-cols-sm-card gap-x-4 gap-y-4 ">
        {Lists.map(list => (
          <ListCard key={'list-' + list.id} list={list} />
        ))}
      </main>
    </>
  )
}
