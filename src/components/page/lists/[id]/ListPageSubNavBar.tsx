import { Button, ButtonProps, Divider } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { BiPlus, BiPurchaseTag, BiRevision } from "react-icons/bi";
import { TbApiApp } from "react-icons/tb";
import { ListPageContext } from "./ListPageProvider";
import { CiGrid2H } from "react-icons/ci";
import { IoGridOutline } from "react-icons/io5";
import { TfiViewListAlt } from "react-icons/tfi";
import { queryClient } from "@/components/providers/RootProviders";
import ToggleButton from "@/components/ui/buttons/ToggleButton";

export default function ListPageSubNavBar() {
    const router = useRouter();
    const { list, viewMode, setViewMode, showTags, setShowTags } = useContext(ListPageContext)

    const buttonProps: ButtonProps = {
        size: "sm",
        variant: "solid",
        type: "button",
        className: "bg-accented",
    }

    return (
        <div className=" flex items-center gap-2 mt-2 mb-5 animate-fade-in">
            <Button
                {...buttonProps}
                onPress={() => router.push(`/lists/${list.id}/add`)}
            >
                <BiPlus className="text-lg" />New Item
            </Button>

            <ToggleButton
                {...buttonProps}
                onPress={() => setShowTags(!showTags)}
            >
                <BiPurchaseTag className="text-lg" />Tags
            </ToggleButton>

            <Button
                {...buttonProps}
            // onPress={() => router.push(`/lists/${listData.id}/api`)}
            >
                <TbApiApp className="text-lg" /> APIs
            </Button>

            <Divider orientation="vertical" className="h-5" />

            <div className="flex-grow">

            </div>

            <Divider orientation="vertical" className="h-5 ml-auto" />

            {/* View Buttons */}

            <ToggleButton
                {...buttonProps}
                isToggled={viewMode === "list"}
                setIsToggled={() => setViewMode("list")}
                onPress={() => setViewMode("list")}
                isIconOnly
            >
                <TfiViewListAlt className="text-sm" />
            </ToggleButton>


            <ToggleButton
                {...buttonProps}
                isToggled={viewMode === "cardsList"}
                setIsToggled={() => setViewMode("cardsList")}
                onPress={() => setViewMode("cardsList")}
                isIconOnly
            >
                <CiGrid2H className="text-lg" />
            </ToggleButton>

            <ToggleButton
                {...buttonProps}
                isToggled={viewMode === "cards"}
                setIsToggled={() => setViewMode("cards")}
                onPress={() => setViewMode("cards")}
                isIconOnly
            >
                <IoGridOutline className="text-lg" />
            </ToggleButton>

            <Divider orientation="vertical" className="h-5" />

            <Button
                {...buttonProps}
                className="bg-accented"
                onPress={() => queryClient.invalidateQueries({ queryKey: ['items', list.id, { trash: false }] })}
                isIconOnly
            >
                <BiRevision className="text-lg" />
            </Button>


        </div>
    )
}