import { TagGroup } from "@/utils/functions/sortTagsByGroup";
import ListPageTagsCard from "./ListPageTagCard";

export default function ListPageGroupTagCard({
    tagGroup: {
        groupName,
        groupTags
    },
    tagsGroups //annoying props drilling but it's fine for now
}: {
    tagGroup: TagGroup,
    tagsGroups: TagGroup[]
}) {

    return (
        <>
            {groupName &&
                <div className="text-center text-sm text-foreground p-1 bg-default bg-opacity-40 rounded-lg animate-fade-in">
                    {groupName}
                </div>
            }
            {groupTags.map(tag => (
                <ListPageTagsCard
                    tag={tag}
                    key={tag.id + 'card'}
                    tagsGroups={tagsGroups}
                />
            ))}
        </>
    )
}