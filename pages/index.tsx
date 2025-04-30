import dynamic from "next/dynamic"
import Head from "next/head"
import { useState, useEffect } from "react"

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
})
const GoogleAdSense = dynamic(() => import("@/components/GoogleAdSense"), {
    ssr: false,
})

const Intro = dynamic(() => import("@/components/Intro"), { ssr: true })

export default function Home() {
    const [isReady, setIsReady] = useState(false)
    const [showIntro, setShowIntro] = useState(false)

    useEffect(() => {
        let isValidMapState = false;
        try {
            const mapState = localStorage.getItem("mapState");
            if (mapState) {
                const parsed = JSON.parse(mapState);
                if (
                    typeof parsed.lat === "number" &&
                    typeof parsed.lng === "number" &&
                    typeof parsed.zoom === "number"
                ) {
                    isValidMapState = true;
                }
            }
        } catch (err) {
            console.error("Error validating mapState:", err);
        }
    
        if (isValidMapState) {
            setIsReady(true);
        } else {
            setShowIntro(true);
        }
    }, [])

    const handleContinentSelected = (lat: number, lng: number) => {
        localStorage.setItem(
            "mapState",
            JSON.stringify({ lat, lng, zoom: 7 })
        )
        setShowIntro(false)
        setIsReady(true)
    }

    return (
        <>
            <Head>
                <title>GoodMap - Find and share good hidden places</title>
                <meta
                    name='description'
                    content='An anonymous community map that easily finds good places around me'
                />
                <link rel='icon' href='https://overcome0.be/favicon.ico' />
                <meta property='og:type' content='website' />
                <meta property='og:url' content='https://overcome0.be/' />
                <meta
                    property='og:title'
                    content='GoodMap - Find and share good hidden places'
                />
                <meta
                    property='og:description'
                    content='An anonymous community map that easily finds good places around me'
                />
                <meta
                    property='og:image'
                    content='https://overcome0.be/goodmap.webp'
                />

                <meta property='twitter:card' content='summary_large_image' />
                <meta property='twitter:url' content='https://overcome0.be/' />
                <meta
                    property='twitter:title'
                    content='GoodMap - Find and share good hidden places'
                />
                <meta
                    property='twitter:description'
                    content='An anonymous community map that easily finds good places around me'
                />
                <meta
                    property='twitter:image'
                    content='https://overcome0.be/goodmap.webp'
                />
            </Head>
            <main className='h-screen bg-gray-100 relative'>
                {showIntro && <Intro onContinentSelect={handleContinentSelected} />}
                {isReady && (
                    <>
                        <MapComponent />
                        <div className="absolute top-[25%] right-4 z-0">
                            <AdFitBanner
                                mobileAdUnit="DAN-WCxQYYTxuTSxEFAF"
                                pcAdUnit="DAN-h3lEt6y18Q5XJYRN"
                                enabled={process.env.NEXT_PUBLIC_ADFIT_ENABLED === "true"}
                                className="hidden md:block"
                            />
                        </div>
                        <GoogleAdSense clientId="ca-pub-9025940068718161" />
                    </>
                )}
            </main>
        </>
    )
}
