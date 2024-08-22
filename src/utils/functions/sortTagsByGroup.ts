import { TagData } from "../types/global";

export interface TagGroup {
    groupName: string | null;
    groupTags: TagData[];
}

export const sortTagsByGroup = (tags: TagData[]) => {
    let ArrayTags: TagGroup[] = [];

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
