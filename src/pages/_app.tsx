import RootLayout from "@/components/layouts/RootLayout";
import RootProviders from "@/components/providers/RootProviders";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RootProviders>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </RootProviders>
  )
}
