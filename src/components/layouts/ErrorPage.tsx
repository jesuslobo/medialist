import { Button, ButtonProps } from '@nextui-org/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { BiArrowBack, BiRevision } from 'react-icons/bi'

export default function ErrorPage({ message, MainMessage }: { message?: string, MainMessage?: string }) {
    const router = useRouter()

    const buttonProps: ButtonProps = {
        className: ' shadow-lg',
        size: 'lg',

    }

    return (
        <>
            <Head>
                <title>MediaList - {MainMessage || message || 'Error'}</title>
            </Head>

            <div className=' w-full h-[90vh] flex items-center justify-center flex-col gap-y-10 pr-[70px] animate-fade-in'>

                <p className=' text-7xl text-center'>{MainMessage || "Something went wrong!"}</p>
                {message && <p className=' text-xl font-semibold text-neutral-400'>{message}</p>}
                <div className='flex gap-x-4'>
                    <Button
                        variant='bordered'
                        onClick={() => router.back()}
                        {...buttonProps}
                    >
                        <BiArrowBack className=" text-xl" />
                        Go Back
                    </Button>

                    <Button
                        variant='ghost'
                        color='primary'
                        onClick={() => router.reload()}
                        {...buttonProps}
                    >
                        <BiRevision className=" text-xl" />
                        Try again
                    </Button>
                </div>
            </div>
        </>
    )
}