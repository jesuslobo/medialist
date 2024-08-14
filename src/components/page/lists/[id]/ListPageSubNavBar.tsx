import { Button, Divider } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { BiPlus, BiPurchaseTag } from "react-icons/bi";
import { TbApiApp } from "react-icons/tb";
import { ListPageContext } from "./ListPageProvider";

export default function ListPageSubNavBar() {
    const router = useRouter();
    const { list } = useContext(ListPageContext)

    return (
        <div className=" flex items-center gap-2 mt-2 mb-5 animate-fade-in">
            <Button
                size="sm"
                className="bg-accented"
                variant="solid"
                type="button"
                onClick={() => router.push(`/lists/${list.id}/add`)}
            >
                <BiPlus className="text-lg" />New Item
            </Button>

            <Button
                size="sm"
                className="bg-accented"
                variant="solid"
                type="button"
            // onClick={} //open tags sidebar
            >
                <BiPurchaseTag className="text-lg" />Tags
            </Button>

            <Button
                size="sm"
                className="bg-accented"
                variant="solid"
                type="button"
            // onClick={() => router.push(`/lists/${listData.id}/api`)}
            >
                <TbApiApp className="text-lg" /> APIs
            </Button>

            <Divider orientation="vertical" className="h-5" />



        </div>
    )
}