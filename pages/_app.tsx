import "@/styles/globals.css"
import "leaflet/dist/leaflet.css"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ToastContainer } from "react-toastify"

import Head from "next/head";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
                <meta name="google-adsense-account" content="ca-pub-9025940068718161"/>
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9025940068718161"
                    crossOrigin="anonymous"   
                    dangerouslySetInnerHTML={{ __html: "" }}                
                />
            </Head>
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
