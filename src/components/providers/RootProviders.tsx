import { NextUIProvider } from "@nextui-org/react";
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
    const [showDevtools, setShowDevtools] = useState(false)

    useEffect(() => {
        // @ts-expect-error
        window.toggleDevtools = () => setShowDevtools((old) => !old)
    }, [])

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <NextUIProvider>
                    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </NextThemesProvider>
                </NextUIProvider>

                {showDevtools && (
                    <React.Suspense fallback={null}>
                        <ReactQueryDevtoolsProduction />
                    </React.Suspense>
                )}
            </QueryClientProvider>
        </>
    )
}