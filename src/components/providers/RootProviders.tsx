import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { lazy, useEffect, useState } from "react";
import AuthProvider from "./AuthProvider";

export const queryClient = new QueryClient()

const ReactQueryDevtoolsProduction = lazy(() =>
    import('@tanstack/react-query-devtools/build/modern/production.js').then(
        (d) => ({
            default: d.ReactQueryDevtools,
        }),
    ),
)

export default function RootProviders({
    children
}: {
    children: React.ReactNode
}) {
    const [showDevtools, setShowDevtools] = useState(true)

    useEffect(() => {
        // @ts-expect-error
        window.toggleDevtools = () => setShowDevtools((old) => !old)
    }, [])

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <HeroUIProvider>
                    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </NextThemesProvider>
                </HeroUIProvider>

                {showDevtools && (
                    <React.Suspense fallback={null}>
                        <ReactQueryDevtoolsProduction />
                    </React.Suspense>
                )}
            </QueryClientProvider>
        </>
    )
}