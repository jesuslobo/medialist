import { tv } from "@nextui-org/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { ButtonHTMLAttributes, DetailedHTMLProps, LinkHTMLAttributes, useState } from "react"

export type BaseNavButtonProps = LinkButtonProps | ClickButtonProps

export default function BaseNavButton(props: BaseNavButtonProps) {
    if ((props as LinkButtonProps)?.link)
        return <LinkButton {...props as LinkButtonProps} />

    return <ClickButton {...props as ClickButtonProps} />
}

const navButton = tv({
    slots: {
        base: "",
        text: "",
    },
    variants: {
        varient: {
            iconOnly: {
                base: "hover:bg-foreground hover:text-background p-2 rounded-lg text-3xl duration-200",
                text: "hidden",
            },
            sideLabel: {
                base: "flex justify-center group p-2 rounded-lg text-3xl text-foreground duration-200 hover:bg-foreground hover:text-background hover:py-3",
                text: "rtl:right-12 rtl:pr-8 rtl:rounded-l-lg rtl:origin-right ltr:left-12 ltr:pl-8 ltr:rounded-r-lg ltr:origin-left absolute justify-center p-3 mt-[-11px]  bg-accented shadow-lg font-[400] text-lg text-foreground duration-200 scale-0 group-hover:scale-100 -z-1"
            }
        },
        active: {
            true: { base: "bg-foreground text-background" }
        },
        defaultVariants: {
            varient: "iconOnly"
        }
    }
})

type Varient = 'iconOnly' | 'sideLabel'

interface SharedProps {
    label: string
    icon: React.ReactNode
    varient?: Varient
    classNames?: {
        base?: string
        text?: string
    }
}

type LinkButtonProps = SharedProps & LinkHTMLAttributes<HTMLAnchorElement> & {
    link: string
}

function LinkButton({
    link,
    label,
    icon,
    varient,
    classNames,
    ...props
}: LinkButtonProps) {
    const router = useRouter()
    const pathname = router.pathname
    const { base, text } = navButton({ varient, active: pathname === link })

    return (
        <Link
            className={base({ class: classNames?.base })}
            href={link}
            {...props}
        >
            {icon}
            <span className={text({ class: classNames?.text })}>
                {label}
            </span>
        </Link>
    )
}

type ButtonAttributes = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
type ClickButtonProps = SharedProps & ButtonAttributes & {
    activeIcon?: React.ReactNode
    onPress?: Function,
    disableActive?: boolean
}

export function ClickButton({
    label,
    icon,
    activeIcon,
    onClick,
    onPress,
    classNames,
    varient,
    disableActive,
    ...props
}: ClickButtonProps) {
    const [isActive, setIsActive] = useState(false)
    const { base, text } = navButton({ varient, active: isActive && !disableActive })

    return (
        <button
            className={base({ class: classNames?.base })}
            onClick={(e) => {
                setIsActive(s => !s)
                onClick?.(e);
                onPress?.()
            }}
            {...props}
        >
            {isActive ? (activeIcon || icon) : icon}
            <span className={text({ class: classNames?.text })}>
                {label}
            </span>
        </button>
    )
}