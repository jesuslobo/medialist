import UserPageSessionsList from "@/components/page/user/UserSessionsList"
import { useUser } from "@/components/providers/AuthProvider"
import TitleBar from "@/components/ui/bars/TitleBar"
import { Button } from "@nextui-org/react"
import { BiPencil } from "react-icons/bi"
import { RiUserLine } from "react-icons/ri"

export default function UserPage() {
    const { user } = useUser()

    const isAdmin = true

    return (
        <>
            <TitleBar
                className="bg-pure-theme p-5 mb-5"
                title={user.username}
                startContent={<RiUserLine className="text-3xl mr-3" />}
            >
                <div className="flex gap-x-2">
                    {isAdmin && (
                        <Button title="Admin" variant="bordered">
                            Admin
                        </Button>
                    )}
                    <Button title="Edit Account" isIconOnly>
                        <BiPencil className="text-xl" />
                    </Button>
                </div>
            </TitleBar>

            <main className="animate-fade-in grid grid-cols-2">
                <UserPageSessionsList />
            </main>
        </>
    )
}