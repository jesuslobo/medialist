import { ItemField } from "@/utils/types/item"
import { Tab, Tabs } from "@nextui-org/react"
import { useContext } from "react"
import ItemFieldMapper from "./ItemFieldMapper"
import { itemPageContext } from "./ItemPageProvider"

export default function ItemPageLayout() {
    const { item } = useContext(itemPageContext)
    const headers = item.layout.map(layout => layout[0])
    const layouts = item.layout.map(layout => layout.slice(1)) as ItemField[][][]

    const gridTemplate = {
        one_row: "1fr",
        left_sidebar: "minmax(10vw, 22vw) minmax(22vw, 75vw)",
        right_sidebar: "minmax(22vw, 75vw) minmax(10vw, 22vw)",
        two_rows: "1fr 1fr",
        three_rows: "1fr 1fr 1fr",
    }

    return (
        <main>
            <Tabs
                variant="light"
                aria-label="LayoutTabs"
                className="w-full flex items-center justify-center py-2"
            >
                {layouts.map((layout, layoutIndex) => (
                    <Tab
                        key={"layout" + layoutIndex}
                        title={headers[layoutIndex].label}
                    >
                        <div
                            className="grid gap-x-3 w-full items-start"
                            style={{ gridTemplateColumns: gridTemplate[headers[layoutIndex].type] }}
                        >
                            {layout.map((column, colIndex) => (
                                <section
                                    key={"layoutColumn" + layoutIndex + colIndex}
                                    className="grid gap-y-3"

                                >
                                    {column.map((field, rowIndex) => (
                                        <ItemFieldMapper
                                            key={"field" + rowIndex}
                                            field={field}
                                            rowIndex={rowIndex}
                                            colIndex={colIndex}
                                        />
                                    ))}
                                </section>
                            ))}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </main>
    )
}