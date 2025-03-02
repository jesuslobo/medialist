import Image from "next/image";
import { BiLogoGithub } from 'react-icons/bi';

export default function RootFooter() {
    return (
        <footer className="px-2 py-3 w-full flex items-center justify-center gap-x-2 font-extrabold">
            <Image
                className="dark:invert opacity-70 duration-200 hover:opacity-100 cursor-default"
                src="/medialist.svg"
                alt="Logo"
                width={25}
                height={25}
            />
            <span className="opacity-70 duration-200 hover:opacity-100 cursor-default">
                Medialist
            </span>
            <span className="opacity-50 cursor-default">|</span>
            <a
                className="flex justify-center items-center opacity-70 duration-200 hover:opacity-100"
                href="https://github.com/khalidibnwalid/medialist"
                target="_blank"
                title="View on GitHub"
            >
                <BiLogoGithub size={25} />
            </a>
        </footer>
    )
};