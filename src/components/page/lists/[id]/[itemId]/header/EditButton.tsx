import { Button, ButtonProps } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { BiPencil } from "react-icons/bi";
import { itemPageContext } from "../ItemPageProvider";

export default function ItemPageEditButton(props: ButtonProps) {
    const router = useRouter()
    const { item } = useContext(itemPageContext)

    return (
        <Button
            size="sm"
            className="text-lg"
            isIconOnly
            {...props}
            title="Edit Item"
            onPress={() => router.push(`/lists/${item.listId}/${item.id}/edit`)}
        >
            <BiPencil />
        </Button>
    )
}