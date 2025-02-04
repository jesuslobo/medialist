import { TagData } from "@/utils/types/global";
import { Input } from "@heroui/react";
import { Dispatch, KeyboardEvent, SetStateAction, useEffect } from "react";
import { BiSearch } from "react-icons/bi";

export default function ListPageTagsSearch({
    setVisibleTags,
    allTags
}: {
    setVisibleTags: Dispatch<SetStateAction<TagData[]>>,
    allTags: TagData[]
}) {
    /**  the state of ListPageTagsList is preserved because of <AnimatePresence>,
     * so if it were unmounted and remounted, it will preserve setVisibleTags, i.e, the old search value,
     * thus to reset setVisibleTags, we need to make it through one of ListPageTagsList children,
     *  in this case ListPageTagsSearch
     * */
    useEffect(() => {
        setVisibleTags(allTags)
    }, [allTags])

    function onSearch(e: KeyboardEvent<HTMLInputElement>) {
        const value = (e.target as HTMLInputElement).value.trim().toLowerCase()
        if (!value) return setVisibleTags(allTags)

        setVisibleTags(prevTags => prevTags.filter(tag =>
            tag.label.toLowerCase().split(" ").some(word => word.startsWith(value))
        ))
    }

    return (
        <Input
            onKeyUp={onSearch}
            size="sm"
            placeholder="Type to search..."
            startContent={<BiSearch className="opacity-80" />}
            className="text-foreground shadow-none"
        />
    )
}