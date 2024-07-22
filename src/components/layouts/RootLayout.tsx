import { Poppins } from 'next/font/google';
import Head from "next/head";

const poppins = Poppins({ weight: '400', subsets: ['latin'] })

export default function RootLayout(
    { children

    }: {
        children: React.ReactNode
    }) {
    return (
        <div className={poppins.className}>
            <Head>
                <title>MediaList</title>
            </Head>
            <main>{children}</main>
        </div>
    )
}