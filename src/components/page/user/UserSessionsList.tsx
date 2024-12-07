import { useUser } from "@/components/providers/AuthProvider"
import { queryClient } from "@/components/providers/RootProviders"
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton"
import httpClient from "@/utils/lib/httpClient"
import { UserSessionData } from "@/utils/types/global"
import { Card, CardBody, Skeleton } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { IconType } from "react-icons"
import { BiCheckDouble, BiLaptop, BiRevision, BiTrash } from "react-icons/bi"
import { FaAndroid, FaApple, FaChrome, FaEdge, FaFirefox, FaInternetExplorer, FaLinux, FaOpera, FaSafari, FaWindows } from "react-icons/fa"

export default function UserPageSessionsList({ className }: { className?: string }) {
    const { data: sessions, isLoading, isSuccess } = useQuery<UserSessionData[]>({
        queryKey: ['sessions'],
        queryFn: () => httpClient().get('sessions')
    })

    return (
        <section className={className}>
            <div className="p-1 pb-4 text-xl flex items-center space-x-2">
                <BiLaptop className="text-2xl" /> <span> Logged-in Devices:</span>
            </div>
            <ul className="grid gap-y-3">
                {isLoading && Array.from({ length: 4 }).map((_, i) =>
                    <Skeleton key={'skeleton_sessions' + i} className="w-full h-16 rounded-2xl" />
                )}
                {isSuccess && sessions.map((session, i) => (
                    <SessionCard key={session.id + i} session={session} />
                ))}
            </ul>
        </section>
    )
}

function SessionCard({
    session: {
        agent: { browser, os, device },
        ...session
    }
}: {
    session: UserSessionData
}) {
    const { logout } = useUser()

    const IconBrowser = typeof browser === 'string' && logos?.[browser?.toLowerCase()] as IconType
    const IconOS = typeof os === 'string' && logos?.[os?.toLowerCase()] as IconType

    const deleteMutation = useMutation({
        mutationFn: (id: string) => httpClient().delete(`sessions/${id}`),
        onSuccess: async ({ message }: { message: string }) => {
            if (message === 'logout') return await logout()
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
        }
    })

    return (
        <li>
            <Card className="bg-accented/70 flex flex-row items-center px-4 gap-x-2 animate-fade-in duration-200 hover:bg-accented/90">
                <CardBody className="grid flex-grow">
                    <span className="text-lg flex flex-row gap-x-2 items-center">
                        {IconOS && <IconOS />} {device} {device && os && '-'} {os}
                    </span>
                    <span className="text-foreground-500 flex flex-row gap-x-2 items-center">
                        {IconBrowser && <IconBrowser />} {browser} - First Login: {(new Date(session.createdAt)).toLocaleString()}
                    </span>
                </CardBody>
                <StatusSubmitButton
                    title="Delete Session"
                    mutation={deleteMutation}
                    onPress={() => deleteMutation.mutate(session.id)}
                    defaultContent={<BiTrash className="text-xl" />}
                    savedContent={<BiCheckDouble className="text-xl" />}
                    errorContent={<BiRevision className="text-xl" />}
                    isIconOnly
                />
            </Card>
        </li>
    )
}

const logos = {
    // Browser
    chrome: FaChrome,
    edge: FaEdge,
    firefox: FaFirefox,
    safari: FaSafari,
    opera: FaOpera,
    ie: FaInternetExplorer,

    // OS
    windows: FaWindows,
    mac: FaApple,
    linux: FaLinux,
    android: FaAndroid,
    ios: FaApple,
} as Record<string, IconType>