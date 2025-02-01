import { ItemTextField } from "@/utils/types/item"

export default function ItemPageTextField({
    field: {
        variant,
        text
    },
    className
}: {
    field: ItemTextField,
    className?: string
}) {
    return (
        <article className={className}>
            {variant === "short"
                ? <h1 className="text-center font-bold">{text}</h1>
                : <p className="text-sm">{text}</p>}
        </article>
    )
}