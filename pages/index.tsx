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
            <main className='h-screen'>
                <MapComponent />
            </main>
        </>
    )
}
