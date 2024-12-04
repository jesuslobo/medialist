import { usersQueryOptions } from "@/utils/lib/tanquery/usersQuery";
import { UserData } from "@/utils/types/global";
import { Spinner } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import AuthLayout from "../features/auth/AuthLayout";

const AuthContext = createContext({
    user: {} as UserData,
} as {
    user: UserData
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: userData, isSuccess, isLoading } = useQuery(usersQueryOptions())

    const isAuthed = isSuccess && Boolean(userData) && Object.keys(userData).length > 0

    if (isLoading) return LoadingAuth()

    return isAuthed ? (
        <AuthContext.Provider value={{
            user: userData,
        }}>
            {children}
        </AuthContext.Provider>
    ) : <AuthLayout />
}

export function useUser() {
    return useContext(AuthContext)
}

function LoadingAuth() {
    return (
        <div>
            <div className="absolute w-full h-full flex flex-col items-center justify-center gap-y-4 bg-black z-50 bg-opacity-55 backdrop-blur-lg animate-fade-in">
                <Spinner
                    aria-label="Checking if you are logged in"
                    size="lg"
                    label="Checking if you are logged in..."
                />
            </div>
            <AuthLayout />
        </div>
    )
}