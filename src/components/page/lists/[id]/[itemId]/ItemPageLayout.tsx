import { useContext } from "react"
import { itemPageContext } from "./ItemPageProvider"
import ItemPageLayoutColumn from "./LayoutColumn"

export default function ItemPageLayout() {
    const { item, activeTabIndex, headerType } = useContext(itemPageContext)
    const [layoutHeader, ...layout] = item?.layout[activeTabIndex] || []
    const gridTemplate = {
        one_row: "1fr",
        left_sidebar: headerType === 'poster_inside' ? "minmax(10vw, 25vw) minmax(25vw, 75vw)" : "minmax(10vw, 21vw) minmax(25vw, 75vw)",
        right_sidebar: headerType === 'poster_inside' ? "minmax(25vw, 75vw) minmax(10vw, 25vw)" : "minmax(25vw, 75vw) minmax(10vw, 21vw)",
        two_rows: "1fr 1fr",
        three_rows: "1fr 1fr 1fr",
    }

    return (
        <main>
            <div
                className="grid items-start gap-x-4 mt-5 animate-fade-in"
                style={{ gridTemplateColumns: gridTemplate[layoutHeader?.type] }}
            >
                {layout.map((_, i) => (
                    <section key={'item-column-' + i} className="grid gap-y-3 items-start">
                        <ItemPageLayoutColumn column={i} />
                    </section>
                ))}
            </div>
        </main>
    )
}