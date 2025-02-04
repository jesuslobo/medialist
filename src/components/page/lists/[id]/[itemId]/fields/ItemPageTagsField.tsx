import { sortTagsByGroup } from "@/utils/functions/sortTagsByGroup"
import { TagData } from "@/utils/types/global"
import { Chip } from "@heroui/react"
import { useRouter } from "next/router"
import { createSerializer, parseAsArrayOf, parseAsString } from "nuqs"
import { useContext } from "react"
import { itemPageContext } from "../ItemPageProvider"

export default function ItemPageTagsField() {
    const { tags } = useContext(itemPageContext)

    const sortedTags = sortTagsByGroup(tags)

    return (
        <article className="grid gap-y-2">
            <h1 className="text-base text-center font-extrabold">Tags</h1>
            {sortedTags.map(({ groupName, groupTags }, index) => (
                <>
                    <h2 className="font-semibold text-sm">{groupName || ''}</h2>
                    <div className="flex flex-wrap gap-2">
                        {groupTags.map(tag => <TagChip key={tag.id + "tagchip"} tag={tag} />)}
                    </div>
                </>
            ))}
        </article>
    )
}

const TagChip = ({ tag }: { tag: TagData }) => {
    const router = useRouter()

    function onClick() {
        const serialize = createSerializer({
            tags: parseAsArrayOf(parseAsString)
        })
        const query = serialize({ tags: [tag.label] })
        router.push(`/lists/${tag.listId + query}`)
    }

    return (
        <Chip
            className="duration-250 hover:bg-pure-opposite hover:text-pure-theme hover:scale-105 hover:cursor-pointer"
            size="sm"
            variant="flat"
            title={tag.description}
            onClick={onClick}
        >
            {tag.label}
        </Chip>)
}