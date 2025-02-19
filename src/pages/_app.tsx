import RootLayout from "@/components/layouts/RootLayout";
import RootProviders from "@/components/providers/RootProviders";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NuqsAdapter } from 'nuqs/adapters/next/pages'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <RootProviders>
      <RootLayout>
        <NuqsAdapter>
          <Component {...pageProps} />
        </NuqsAdapter>
      </RootLayout>
    </RootProviders>
  )
}
