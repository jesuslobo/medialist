import { twJoin } from "tailwind-merge";

export default function TitleBar({
    title,
    className = 'p-5 mb-5',
    children,
    startContent,
    middleContent,
}: {
    title?: string,
    className?: string,
    children?: React.ReactNode,
    startContent?: React.ReactNode,
    middleContent?: React.ReactNode,
}) {
    return (
        <header className={twJoin(
            "flex items-center lg:justify-center flex-wrap gap-y-3 rounded-2xl text-foreground capitalize font-extrabold bg-left bg-pure-theme",
            className
        )}>
            {startContent}

            {title &&
                <h1 className='text-lg'>
                    {title}
                </h1>
            }
            <div className="flex-grow">{middleContent}</div>
            <div className=" flex-none shadow-lg rounded-2xl">{children}</div>
        </header>
    )
}
