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
            </Head>
            <main className='h-screen'>
                <MapComponent />
            </main>
        </>
    )
}
