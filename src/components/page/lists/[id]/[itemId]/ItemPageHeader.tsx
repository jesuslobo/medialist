import { useContext } from "react";
import { itemPageContext } from "./ItemPageProvider";
import ItemPageHeaderBody from "./headerFields/ItemPageHeaderBody";
import ItemPagePoster from "./headerFields/ItemPagePoster";

export default function ItemPageHeader() {
    const { item } = useContext(itemPageContext)
    const headerType = item?.header?.type || "poster_beside"

    const gridTemplate = {
        poster_beside: 'minmax(10vw, 22vw) minmax(22vw, 75vw)',
        poster_inside: '1fr', // to change
        poster_on_top: '1fr', // to change
    }

    return (
        <header
            className=" grid grid-cols-4 gap-x-4 text-foreground items-start"
            style={{
                gridTemplateColumns: gridTemplate[headerType],
            }}
        >
            {headerType === 'poster_beside' &&
                <ItemPagePoster />}
            {/* layout sidebar */}

            <ItemPageHeaderBody />
        </header>
    )
}