import "@/styles/globals.css"
import "leaflet/dist/leaflet.css"
// Conditionally import the cron job only on the server-side
if (typeof window === 'undefined') {
    import("@/lib/cron");
}
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ToastContainer } from "react-toastify"

import Head from "next/head";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    const isProd = process.env.NODE_ENV === "production";
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            </Head>
            <SessionProvider session={session}>
                {isProd && (
                <GoogleAnalytics
                    gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""}
                />)}
                <Component {...pageProps} />
            </SessionProvider>
            <ToastContainer />
        </>
    )
}
