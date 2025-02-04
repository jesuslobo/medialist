import { Tab, Tabs, TabsProps } from "@heroui/react"
import { Key, useContext } from "react"
import { itemPageContext } from "../ItemPageProvider"

export default function ItemPageLayoutTabs(props: Omit<TabsProps, 'aria-label' | 'selectedKey' | 'onSelectionChange'>) {
    const { item, activeTabIndex, setActiveTabIndex } = useContext(itemPageContext)
    const tabs = item?.layout.map(layout => layout[0].label) || []

    return (
        <Tabs
            {...props}
            aria-label="LayoutTabs"
            selectedKey={activeTabIndex}
            onSelectionChange={setActiveTabIndex as (key: Key) => void}
        >
            {tabs.map((tab, index) => (
                <Tab key={index} title={tab} />
            ))}
        </Tabs>
    )
}