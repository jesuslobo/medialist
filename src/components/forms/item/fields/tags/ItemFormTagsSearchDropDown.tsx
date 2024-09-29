import { sortTagsByGroup } from "@/utils/functions/sortTagsByGroup"
import { validatedID } from "@/utils/lib/generateID"
import { Button, Checkbox, CheckboxGroup, Divider, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"
import { Dispatch, KeyboardEvent, SetStateAction, useContext, useRef, useState } from "react"
import { BiPurchaseTag } from "react-icons/bi"
import { ItemFormContext } from "../../ItemFormProvider"

export default function ItemFormTagsSearchDropDown({
    selectedTags,
    setSelectedTags,
}: {
    selectedTags: string[],
    setSelectedTags: Dispatch<SetStateAction<string[]>>,
}) {
    const { tags } = useContext(ItemFormContext)
    const searchRef = useRef<HTMLInputElement>(null)

    const [displayedTags, setDisplayedTags] = useState(tags)
    const newTags = selectedTags
        .filter(value => !validatedID(value))
        .map(value => { return { id: value, label: value } })

    const groupedDisplayedTags = [
        ...sortTagsByGroup(displayedTags),
        { groupName: "New Tags", groupTags: newTags },
    ]

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
    }

    function handleSearch() {
        const input = searchRef.current?.value.trim().toLowerCase() || null
        if (!input) return setDisplayedTags(tags) //return all results

        const filtered = tags.filter(tag =>
            tag.label.toLowerCase().split(" ").some(word => word.startsWith(input)) // so you can search by typing the n-th word
        )
        setDisplayedTags(filtered)
    }

    function onKeyEvent(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') return addTag()
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