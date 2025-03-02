import { TagData } from "../types/global";

type MinimalTag = Pick<TagData, 'groupName'>;

export interface TagGroup<T extends MinimalTag = TagData> {
    groupName: string | null;
    groupTags: T[];
}

export function sortTagsByGroup<T extends MinimalTag = TagData>(tags: T[]) {
    let ArrayTags: TagGroup<T>[] = [];

    tags.forEach((tag) => {
        const groupName = tag.groupName || "" //if group_name doesn't exist go for null
        const groupExist = ArrayTags.find((group) => group.groupName === groupName);

        if (groupExist)
            return groupExist.groupTags.push(tag)

        ArrayTags.push({
            groupName,
            groupTags: [tag],
        })
    })

    //to make sure that ungroupedTags are the First
    const ungroupedTags = ArrayTags.find(group => group.groupName == "")
    if (ungroupedTags) {
        const index = ArrayTags.indexOf(ungroupedTags);
        if (index !== -1) {
            ArrayTags.splice(index, 1);
            ArrayTags.unshift(ungroupedTags);
        }
    }

    return ArrayTags;
}
