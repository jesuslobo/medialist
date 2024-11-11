import { tv } from "@nextui-org/react";
import BaseNavButton, { BaseNavButtonProps } from "./BaseNavButtons";

export type BaseNavBarProps = {
    className?: string;
    alignment?: 'center' | 'split';
    buttonsVarient?: BaseNavButtonProps['varient'];
    orientation?: 'vertical' | 'horizontal';
    items: BaseNavButtonProps[];
    children?: React.ReactNode;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
};

const nav = tv({
    base: 'z-50 flex gap-x-4',
    variants: {
        orientation: {
            vertical: 'flex-col gap-y-3',
            horizontal: '',
        },
        alignment: {
            center: 'items-center justify-center',
            split: '',
        },
    },
    defaultVariants: {
        alignment: 'center',
        orientation: 'horizontal',
    }
})

//use twVarient instead of multiple NavSideBars
export default function BaseNavBar({
    items,
    className,
    alignment,
    buttonsVarient = 'iconOnly',
    orientation,
    children,
    startContent,
    endContent,
}: BaseNavBarProps) {
    const base = nav({ class: className, alignment, orientation })

    return (
        <nav className={base}>
            {startContent}
            {items?.map((item) => (
                <BaseNavButton
                    key={'nav-' + item.label}
                    varient={item?.varient || buttonsVarient}
                    {...item}
                />
            ))}
            {children}
            {alignment === 'split' && <div className="flex-grow"></div>}
            {endContent}
        </nav>
    );
}