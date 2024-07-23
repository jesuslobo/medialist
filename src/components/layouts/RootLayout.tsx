import { Poppins } from 'next/font/google';
import Head from "next/head";
import { BiCollection, BiTrashAlt } from 'react-icons/bi';
import NavSideBar from '../ui/bars/NavSideBar';
// import { RiUserLine } from 'react-icons/ri';

const poppins = Poppins({ weight: '400', subsets: ['latin'] })

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    const navItems = [
        // { label: "Home", link: "/", icon: <BiHomeAlt2 key="nav-BiHomeAlt2" /> },
        { label: "Lists", link: "/", icon: <BiCollection key="nav-BiHomeAlt2" /> },
        { label: "Trash", link: "/trash", icon: <BiTrashAlt key="nav-BiHomeAlt2" /> },
        // { label: "RSS", link: "/RSS", icon: <BiRss key="nav-BiHomeAlt2" /> },
        // { label: userData.username, link: "/user", icon: <RiUserLine key="nav-BiUserCircle" /> },
    ]

    const RTL = false

    return (
        <>
            <Head>
                <title>MediaList</title>
            </Head>

            <NavSideBar navItems={navItems} />

            <div className={poppins.className + ' py-5 ltr:ml-[90px] ltr:mr-[20px] rtl:mr-[90px] rtl:ml-[20px]'}>
                <div>{children}</div>
            </div>
        </>
    )
}