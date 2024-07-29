import TitleBar from "@/components/ui/bars/TitleBar";
import { Button, ButtonGroup } from "@nextui-org/react";
import { BiCollection, BiPlus, BiRevision } from "react-icons/bi";

export default function ListsPage() {
  return (
    <>
      <TitleBar
        title="Lists"
        startContent={<BiCollection className="text-3xl mr-3 flex-none " />}
        pointedBg
      >
        <ButtonGroup>
          <Button className="bg-accented">
            <BiRevision className="text-base" /> Refresh
          </Button>
          <Button className="bg-accented">
            <BiPlus className="text-base" /> Add
          </Button>
        </ButtonGroup>
      </TitleBar>

      <main className="">

      </main>
    </>
  )
}
