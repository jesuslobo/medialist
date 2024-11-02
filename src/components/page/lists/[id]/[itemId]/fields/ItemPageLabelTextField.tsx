import { ItemLabelTextField } from "@/utils/types/item"

export default function ItemPageLabelTextField({
    field: {
        body,
        label,
        countable,
    }
}: {
    field: ItemLabelTextField
}) {
    return (
        <article>
            <b>{label}</b>: {body}
        </article>
    )
}