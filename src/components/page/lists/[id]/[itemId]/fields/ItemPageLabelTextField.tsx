import { ItemLabelTextField } from "@/utils/types/item"

export default function ItemPageLabelTextField({
    field: {
        body,
        label,
        countable,
    },
    className
}: {
    field: ItemLabelTextField,
    className?: string
}) {
    return (
        <article className={className}>
            <b>{label}</b>: {body}
        </article>
    )
}