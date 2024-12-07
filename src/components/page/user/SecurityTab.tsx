import { BiKey } from "react-icons/bi";
import UserPagePasswordCard from "./PasswordCard";
import UserPageSessionsList from "./UserSessionsList";
import UserPageUsernameCard from "./UsernameCard";

export default function UserPageSecurityTab() {
    return (
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                <section className="col-span-2 lg:col-span-1">
                    <div className="p-1 pb-4 text-xl flex items-center space-x-2">
                        <BiKey className="text-2xl" /> <span> Account Settings:</span>
                    </div>
                    <ul className="grid gap-y-3 animate-fade-in">
                        <UserPageUsernameCard />
                        <UserPagePasswordCard />
                    </ul>
                </section>
                <UserPageSessionsList />
            </div>
    )
}

