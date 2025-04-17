import dynamic from "next/dynamic"
import Head from "next/head"

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className='h-screen flex items-center justify-center'>
            지도 로딩중...
        </div>
    ),
})

export default function Home() {
    return (
        <>
            <Head>
                <title>GoodMap - 숨겨진 좋은 장소를 찾아보세요</title>
                <meta
                    name='description'
                    content='내 주변의 좋은 장소를 쉽게 찾는 익명 커뮤니티 지도'
                />
            </Head>
            <main className='h-screen'>
                <MapComponent />
            </main>
        </>
    )
}
