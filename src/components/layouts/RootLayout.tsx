import httpClient from '@/utils/lib/httpClient';
import { Spinner } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { Poppins } from 'next/font/google';
import Head from "next/head";
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { BiCollection, BiLogOutCircle, BiTrashAlt } from 'react-icons/bi';
import { BsSun } from 'react-icons/bs';
import { RiMoonClearLine, RiUserLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { AuthContext } from '../providers/AuthProvider';
import { queryClient } from '../providers/RootProviders';
import BaseNavBar from '../ui/bars/nav/BaseNavBar';
import BaseNavButton, { BaseNavButtonProps } from '../ui/bars/nav/BaseNavButtons';

const poppins = Poppins({ weight: '400', subsets: ['latin'] })

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    const { userData } = useContext(AuthContext)
    const navItems = [
        { label: "Lists", link: "/", icon: <BiCollection key="nav-BiHomeAlt2" /> },
        { label: "Trash", link: "/trash", icon: <BiTrashAlt key="nav-BiHomeAlt2" /> },
        // user can never be undefined in this page, since this page is user-only
        { label: (userData?.username) as string, link: "/user", icon: <RiUserLine key="nav-BiUserCircle" /> },
    ]

    return (
        <>
            <Head>
                <title>MediaList</title>
            </Head>
            <div className='text-foreground grid grid-cols-sidebar sm:grid-cols-1'>
                <div className='sm:hidden w-full h-screen z-50'>
                    <BaseNavBar
                        className="fixed top-0 p-5 pt-10 h-screen"
                        buttonsVarient='sideLabel'
                        orientation='vertical'
                        alignment='split'
                        items={navItems}
                        endContent={
                            <>
                                <ThemeButton varient='sideLabel' />
                                <LogOutButton varient='sideLabel' />
                            </>
                        }
                    />
                </div>
                <BaseNavBar
                    items={navItems}
                    className='hidden sm:flex fixed bottom-0 w-full shadow-custom-md p-3 bg-accented'
                />
                <div className={twJoin(poppins.className, 'py-5 ltr:pr-5 rtl:pl-5 sm:px-5')}>
                    <div>{children}</div>
                </div>
            </div>
        </>
    )
}

const ThemeButton = ({ varient }: { varient: BaseNavButtonProps['varient'] }) => {
    const { theme, setTheme } = useTheme()
    return (
        <BaseNavButton
            varient={varient}
            label="Theme"
            icon={theme === 'dark' ? <RiMoonClearLine /> : <BsSun />}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            disableActive
        />)
}

const LogOutButton = ({ varient }: { varient: BaseNavButtonProps['varient'] }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function logout() {
        setIsLoading(true)
        await httpClient().delete('sessions')
        queryClient.clear()
        setIsLoading(false)
        router.push('/')
    }

    return (
        <BaseNavButton
            varient={varient}
            icon={isLoading ? <Spinner color="current" /> : <BiLogOutCircle />}
            label="Logout"
            onClick={logout}
            disabled={isLoading}
            disableActive
        />
    )
}