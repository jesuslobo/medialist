import { Input } from "@heroui/react";
import { useContext } from "react";
import { BiSearch } from "react-icons/bi";
import { ListPageContext } from "./ListPageProvider";

export default function ListPageSearchBar() {
    const { setFilterSettings } = useContext(ListPageContext)

    function onSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        const value = (e.target as HTMLInputElement).value.trim().toLowerCase()
        setFilterSettings(prev => ({ ...prev, search: value }))
    }

    return (
        <Input
            onKeyUp={onSearch}
            radius="lg"
            placeholder="Type to search..."
            startContent={<BiSearch className="opacity-80" size={20} />}
            className="text-foreground shadow-none"
        />
    )
}