import TitleBar from "@/components/ui/bars/TitleBar";
import { Skeleton } from "@nextui-org/react";
import { BiSearch } from "react-icons/bi";


export default function ListsLoading() {
    return (
        <TitleBar
            startContent={<>
                <BiSearch className="text-3xl mr-3 flex-none" />
                <Skeleton className=" w-96 h-10 backdrop-blur-3xl opacity-50 rounded-xl shadow-lg" />
            </>}
            pointedBg
        >

            <Skeleton className="w-[250px] h-10 rounded-xl shadow-lg" />
        </TitleBar>
    )
}