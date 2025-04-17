import "@/styles/globals.css"
import "leaflet/dist/leaflet.css"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ToastContainer } from "react-toastify"

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <>
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
