import { useContext } from "react"
import ItemFieldMapper from "./ItemFieldMapper"
import { itemPageContext } from "./ItemPageProvider"

export default function ItemPageLayoutColumn({ column }: { column: number }) {
    const { item, activeTabIndex } = useContext(itemPageContext)
    const [_, ...layout] = item?.layout[activeTabIndex]

    const nCol = layout?.[column]
    return (
        <>
            {nCol?.map((field, rowIndex) => (
                <ItemFieldMapper
                    key={"field" + rowIndex}
                    field={field}
                />
            ))}
        </>
    )
}