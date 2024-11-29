import { usersQueryOptions } from "@/utils/lib/tanquery/usersQuery";
import { UserData } from "@/utils/types/global";
import { useQuery } from "@tanstack/react-query";
import { createContext } from "react";
import AuthLayout from "../features/auth/AuthLayout";

export const AuthContext = createContext({} as { userData: UserData })

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: userData, isSuccess: isAuthenticated } = useQuery(usersQueryOptions())


    return isAuthenticated ? (
        <AuthContext.Provider value={{ userData }}>
            {children}
        </AuthContext.Provider>
    ) : <AuthLayout />
}
