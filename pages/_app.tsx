import "@/styles/globals.css"
import "leaflet/dist/leaflet.css"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ToastContainer } from "react-toastify"
import Script from "next/script";
import Head from "next/head";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            </Head>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9025940068718161"
                strategy="afterInteractive"
                crossOrigin="anonymous"
            />
            <SessionProvider session={session}>
                <GoogleAnalytics
                    gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""}
                />
                <Component {...pageProps} />
            </SessionProvider>
            <ToastContainer />
        </>
    )
}
