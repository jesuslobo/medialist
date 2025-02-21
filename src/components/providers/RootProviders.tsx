import { HeroUIProvider, ToastProps, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
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
                <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                    <HeroUIProvider>
                        <ToastProvider toastProps={toastProps} placement="bottom-right" />
                        <AuthProvider>
                            <NuqsAdapter>
                                {children}
                            </NuqsAdapter>
                        </AuthProvider>
                    </HeroUIProvider>
                </NextThemesProvider>

                {showDevtools && (
                    <React.Suspense fallback={null}>
                        <ReactQueryDevtoolsProduction />
                    </React.Suspense>
                )}
            </QueryClientProvider >
        </>
    )
}

const toastProps = {
    variant: 'bordered',
    shouldShowTimeoutProgess: true,
    timeout: 1500,
} as ToastProps