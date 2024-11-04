import { Chip } from "@nextui-org/react"
import { useContext, useState } from "react"
import { useFieldArray } from "react-hook-form"
import { ItemFormContext } from "../../ItemFormProvider"
import ItemFormTagsSearchDropDown from "./ItemFormTagsSearchDropDown"

/** The Tags Field is:
 * - and enforced field, unremovable
 * - only one per Item
 * - only here to allow for custom postioning
 * - it doesn't store its own values in the layoutTabs state, instead it uses a saperate useFieldArray
 */
export default function ItemFormTagsField() {
    const { itemForm, tags } = useContext(ItemFormContext)
    const { control, getValues } = itemForm

    const { replace } = useFieldArray({
        control,
        name: "tags" as any // :D
    })

    const idToName = (id: string) => tags.find(tag => tag.id === id)?.label
    const currentTags = getValues("tags")?.map(id => { return { id, label: idToName(id) || id } }).filter(Boolean) || []

    let currentTagsIDs = [] as string[]
    let currentNewTags = [] as string[]
    currentTags.forEach(tag => tag.label === tag.id ? currentNewTags.push(tag.label) : currentTagsIDs.push(tag.id))

    // newTags will be stored as a name, while existing tags will be stored as an id
    const [selectedTags, setSelectedTags] = useState<string[]>(currentTagsIDs);

    // bind the selectedTags state to the form state
    type setStateCallback = ((prev: string[]) => string[])
    function setTags(value: string[] | setStateCallback) {
        if (Array.isArray(value)) {
            setSelectedTags(value)
            replace(value)
            return
        }
        // if it's a function
        setSelectedTags(value)
        replace(value(selectedTags))

    }

    function removeTag(index: number) {
        const tag = currentTags[index]
        setTags(prev => prev.filter(id => id !== tag.id))
    }

    return (
        <article className="space-y-2 p-1">
            <ItemFormTagsSearchDropDown
                selectedTags={selectedTags}
                setSelectedTags={setTags}
            />

            <div className="max-h-80 overflow-auto flex gap-2 flex-wrap">
                {currentTags.map((tag, index) => (
                    <Chip
                        key={"tag-" + tag.id}
                        className="flex gap-x-1 animate-fade-in"
                        size="lg"
                        onClose={() => removeTag(index)}
                    >
                        {currentTags[index].label}
                    </Chip>
                ))}
            </div>
        </article>
    )
}
