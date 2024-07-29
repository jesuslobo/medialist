import { queryClient } from "@/components/providers/RootProviders";
import httpClient from "@/utils/lib/httpClient";
import { Spinner } from "@nextui-org/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { BiLogOutCircle } from "react-icons/bi";
import { BsSun } from "react-icons/bs";
import { RiMoonClearLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
// import { queryClient } from "@/components/providers/RootProviders";

interface NavButtonProps {
    label: string
    link: string
    icon: React.ReactNode
    bottom?: boolean
}

interface ClickButtonProps {
    label: string
    onClick: Function
    icon: React.ReactNode
    activeIcon?: React.ReactNode
    isDisabled?: boolean
}

function NavSideBar({ navItems }: { navItems: NavButtonProps[] }) {
    const { theme, setTheme } = useTheme()

    return (
        <nav className=" fixed flex flex-col gap-y-3 pt-10 rtl:right-0 rtl:top-0 ltr:left-0 ltr:top-0 h-[100vh] p-5 rounded-2xl drop-shadow-lg z-[100]" >

            {navItems.map((button) => !button?.bottom &&
                <NavBut key={'nav-' + button.label} {...button} />
            )}

            <div className="flex-grow"></div>

            {navItems?.map((button) => button?.bottom &&
                <NavBut key={'nav-' + button.label} {...button} />
            )}

            <ClickBut
                label="Theme"
                icon={theme === 'dark' ? <RiMoonClearLine /> : <BsSun />}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />

            <LogOutBut />

        </nav>
    )
}

const buttonClassNames = " flex justify-center group p-2 rounded-lg text-3xl text-foreground duration-200 hover:bg-foreground hover:text-background hover:py-3"
const spanClassNames = " rtl:right-12 rtl:pr-8 rtl:rounded-l-lg rtl:origin-right ltr:left-12 ltr:pl-8 ltr:rounded-r-lg ltr:origin-left absolute justify-center  p-3 mt-[-11px]  bg-accented shadow-lg font-[400] text-lg text-foreground duration-200 scale-0 group-hover:scale-100 float-left z-[-1]"

const NavBut = ({ link, label, icon }: NavButtonProps) => {
    const router = useRouter()
    const pathname = router.pathname

    return (
        <Link
            className={twMerge(
                buttonClassNames,
                pathname === link && 'bg-foreground text-background'
            )}
            href={link}
        >

            {icon}

            <span className={spanClassNames}>
                {label}
            </span>
        </Link>
    )
}

const ClickBut = ({ label, icon, onClick, activeIcon, isDisabled }: ClickButtonProps) => {
    const [isActive, setIsActive] = useState(false)

    return (
        <button
            className={buttonClassNames} // active the button when we are inside its page: usePathname()
            onClick={() => { onClick(); setIsActive(e => !e) }}
            disabled={isDisabled}
        >
            {isActive ? (activeIcon || icon) : icon}
            <span className={spanClassNames}>
                {label}
            </span>
        </button>

    )
}

const LogOutBut = () => {
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
        <ClickBut
            label="Logout"
            icon={isLoading ? <Spinner color="current" /> : <BiLogOutCircle />}
            onClick={logout}
            isDisabled={isLoading}
        />
    )
}

export default NavSideBar;

