import ToggleButton from "@/components/ui/buttons/ToggleButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery";
import { ItemSaveResponse } from "@/utils/types/item";
import { ButtonProps } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { BiSolidStar, BiStar } from "react-icons/bi";
import { itemPageContext } from "../ItemPageProvider";

export default function ItemPageFavButton(props: ButtonProps) {
    const { item } = useContext(itemPageContext)

    const mutation = useMutation({
        mutationFn: (formData: FormData) => httpClient().patch(`items/${item.id}`, formData),
        onSuccess: ({ item }: ItemSaveResponse) => mutateItemCache(item, "edit"),
    })

    const toggle = () => {
        const formData = new FormData()
        formData.append('fav', JSON.stringify(!item.fav))
        mutation.mutate(formData)
    }

    return (
        <ToggleButton
            size="sm"
            className="text-lg"
            {...props}
            activeColor="warning"
            toggledChildren={<BiSolidStar />}
            isToggled={item.fav}
            setIsToggled={toggle}
            title="Edit Item"
            isIconOnly
        >
            <BiStar />
        </ToggleButton>
    )
}