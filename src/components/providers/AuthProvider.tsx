import { userQueryOptions } from "@/utils/lib/tanquery/userQuery";
import { UserData } from "@/utils/types/global";
import { useQuery } from "@tanstack/react-query";
import { createContext } from "react";
import AuthLayout from "../layouts/AuthLayout";

export const AuthContext = createContext({} as { userData: UserData | undefined })

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: userData, isSuccess: isAuthenticated } = useQuery(userQueryOptions())


    return isAuthenticated ? (
        <AuthContext.Provider value={{ userData }}>
            {children}
        </AuthContext.Provider>
    ) : <AuthLayout />
}
