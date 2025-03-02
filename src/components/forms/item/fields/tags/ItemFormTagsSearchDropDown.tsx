import { sortTagsByGroup } from "@/utils/functions/sortTagsByGroup"
import { TagData } from "@/utils/types/global"
import { Button, Checkbox, CheckboxGroup, Divider, Input, Popover, PopoverContent, PopoverTrigger } from "@heroui/react"
import { Dispatch, KeyboardEvent, SetStateAction, useContext, useRef, useState } from "react"
import { BiPurchaseTag } from "react-icons/bi"
import { ItemFormContext } from "../../ItemFormProvider"

type FormTag = Pick<TagData, 'id' | 'label' | 'groupName'>

export default function ItemFormTagsSearchDropDown({
    selectedTags,
    setSelectedTags,
}: {
    selectedTags: string[],
    setSelectedTags: Dispatch<SetStateAction<string[]>>,
}) {
    const searchRef = useRef<HTMLInputElement>(null)
    const { tags } = useContext(ItemFormContext)
    const tagsIDs = new Set(tags.map(tag => tag.id))

    const newTags = selectedTags
        .filter(value => !tagsIDs.has(value))
        .map(value => ({ id: value, label: value, groupName: "New Tags" })) as FormTag[]

    const allTags = (tags as unknown as FormTag[]).concat(newTags)
    const [displayedTags, setDisplayedTags] = useState(allTags)

    const groupedDisplayedTags = sortTagsByGroup(displayedTags)

    function addTag() {
        const input = searchRef.current?.value.trim() || null
        if (!input) return

        // a new tag is stored as a label/name, while an existing tag is stored as an id
        const tagExists = tags.find(tag => tag.label.toLowerCase() == input.toLowerCase())
        const tagIsUsed = selectedTags.find(value => value == tagExists?.id || value == input)
        if (tagIsUsed) return //to ignore if you want to re-add the same tag

        // add it to the list
        setSelectedTags(prev => [...prev, tagExists?.id || input])
        searchRef.current?.blur
        return input
    }

    function handleSearch() {
        const input = searchRef.current?.value.trim().toLowerCase() || null
        if (!input) return setDisplayedTags(allTags) //return all results

        const filtered = allTags.filter(tag =>
            tag.label.toLowerCase().split(" ").some(word => word.startsWith(input)) // so you can search by typing the n-th word
        )
        setDisplayedTags(filtered)
    }

    function onKeyEvent(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            const newTag = addTag()
            if (newTag)
                setDisplayedTags(e => [...e, { id: newTag, label: newTag, groupName: "New Tags" }])
            return
        }
        handleSearch()
    }

    return (
        <Popover onClose={() => setDisplayedTags(tags)}>
            <PopoverTrigger>
                <Button className="flex-none w-full">
                    <BiPurchaseTag />
                    Tags
                </Button>
            </PopoverTrigger>
            <PopoverContent className="px-4 py-2 rounded-2xl grid">

                <CheckboxGroup
                    label="Selected Tags"
                    value={selectedTags}
                    onValueChange={setSelectedTags}
                    className="grid grid-cols-1 min-w-60 max-w-96 gap-y-1 overflow-y-auto overflow-x-hidden max-h-96 pr-2 "
                >
                    {groupedDisplayedTags?.map((tagGroup, index) => (
                        <>
                            {tagGroup.groupName &&
                                <div
                                    key={index + '-' + tagGroup}
                                    className="flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-sm rounded-lg animate-fade-in"
                                >
                                    {tagGroup.groupName}
                                </div>
                            }
                            {tagGroup.groupTags.map(tag =>
                                <Checkbox
                                    className="animate-fade-in"
                                    key={index + '-' + tag.label}
                                    value={tag.id}
                                >
                                    {tag.label}
                                </Checkbox>
                            )}
                        </>
                    ))}
                </CheckboxGroup>

                <div className=" w-full sticky bottom-1 grid">
                    <Divider orientation="horizontal" className="my-2" />
                    <Input
                        ref={searchRef}
                        onKeyUp={onKeyEvent}
                        size="sm"
                        variant="flat"
                        label="Search or Add Tags"
                    />

                </div>

            </PopoverContent>
        </Popover>
    )
};