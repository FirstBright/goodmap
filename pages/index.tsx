import Navbar from "@/components/Navbar"
import dynamic from "next/dynamic"
import Head from "next/head"
import { useState, useEffect } from "react"
import { prisma } from "@/lib/prisma";

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
const Intro = dynamic(() => import("@/components/Intro"), { ssr: true })

interface MarkerData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface HomeProps {
    marker?: MarkerData;
}

export default function Home({ marker }: HomeProps) {
    const [isReady, setIsReady] = useState(false)
    const [showIntro, setShowIntro] = useState(false)

    useEffect(() => {
        if (marker) {
            localStorage.setItem(
                "mapState",
                JSON.stringify({ lat: marker.latitude, lng: marker.longitude, zoom: 15 })
            );
            setIsReady(true);
            return;
        }

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
    }, [marker])

    const handleContinentSelected = (lat: number, lng: number) => {
        const mapState = { lat, lng, zoom: 7 };
        localStorage.setItem(
            "mapState",
            JSON.stringify(mapState)
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "GoodMap",
                            "url": "https://overcome0.be/",
                            "description": "An anonymous community map to discover and share hidden gems around the world.",
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://overcome0.be/?q={search_term_string}",
                                "query-input": "required name=search_term_string",
                            },
                        }),
                    }}
                />
            </Head>
            <Navbar />
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
                                className="md:block"
                            />
                        </div>
                    </>
                )}
            </main>
        </>
    )
}

import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { markerId } = context.query;

    if (markerId && typeof markerId === 'string') {
        // If a markerId is present, fetch marker data and pass it as props
        const marker = await prisma.marker.findUnique({
            where: { id: markerId },
        });

        if (marker) {
            return {
                props: {
                    marker: {
                        id: marker.id,
                        name: marker.name,
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                    },
                },
            };
        }
    }

    return { props: {} };
}
