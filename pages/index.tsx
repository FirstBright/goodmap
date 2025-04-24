import dynamic from "next/dynamic"
import Head from "next/head"



const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className='h-screen flex items-center justify-center'>
            Loading...
        </div>
    ),
})
const AdFitBanner = dynamic(() => import("@/components/AdFitBanner"), {
    ssr: false,
});
const GoogleAdSense = dynamic(() => import("@/components/GoogleAdSense"), {
    ssr: false,
});

export default function Home() {
    return (
        <>
            <Head>
                <title>GoodMap - Find and share good hidden places</title>
                <meta
                    name='description'
                    content='An anonymous community map that easily finds good places around me'
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://overcome0.be/" />
                <meta property="og:title" content="GoodMap - Find and share good hidden places" />
                <meta property="og:description" content="An anonymous community map that easily finds good places around me" />
                <meta property="og:image" content="https://overcome0.be/og/goodmap.webp" />


                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://overcome0.be/" />
                <meta property="twitter:title" content="GoodMap - Find and share good hidden places" />
                <meta property="twitter:description" content="An anonymous community map that easily finds good places around me" />
                <meta property="twitter:image" content="https://overcome0.be/og/goodmap.webp" />
            </Head>
            <main className="min-h-screen flex flex-col">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <MapComponent />
                    </div>
                    <div className="md:w-[160px] flex justify-center items-start">
                        <AdFitBanner
                            mobileAdUnit="DAN-WCxQYYTxuTSxEFAF"
                            pcAdUnit="DAN-h3lEt6y18Q5XJYRN"
                            enabled={process.env.NEXT_PUBLIC_ADFIT_ENABLED === "true"}
                            className="md:sticky md:top-4"
                        />
                    </div>
                    <GoogleAdSense clientId = 'ca-pub-9025940068718161' />
                </div>
            </main>
        </>
    )
}
