// pages/markers/index.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Head from "next/head"

interface Post {
    id: string
    title: string
    content: string
    createdAt: string
    likes: number
}

interface Marker {
    id: string
    name: string
    latitude: number
    longitude: number
    posts: Post[]
}
interface Props {
    markers: Marker[]
}

export default function MarkersPage({ markers }: Props) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "GoodMap - 모든 목록",
        description: "GoodMap에서 장소 목록을 확인하고, 리뷰를 공유하세요.",
        url: "https://overcome0.be/markers",
        hasPart: markers.map((marker) => ({
            "@type": "Place",
            name: marker.name,
            description: `GoodMap에서 ${marker.name}의 리뷰와 정보를 확인하세요.`,
            geo: {
                "@type": "GeoCoordinates",
                latitude: marker.latitude,
                longitude: marker.longitude,
            },
            review: marker.posts.map((post: Post) => ({
                "@type": "Review",
                name: post.title,
                reviewBody: post.content,
                datePublished: post.createdAt,
                author: { "@type": "Person", name: "Anonymous" },
            })),
            url: `https://overcome0.be/markers#marker-${marker.id}`,
            image: "https://overcome0.be/goodmap.webp",
        })),
    };
    return (
        <>
            <Head>
                <title>GoodMap - 모든 목록</title>
                <meta
                    name="description"
                    content="GoodMap에서 장소 목록을 확인하고, 리뷰를 공유하세요."
                />
                <meta
                    name="keywords"
                    content="GoodMap, 장소, 지도, 리뷰, 여행, 뷰, 맛집, 공간"
                />
                <meta name="robots" content="index, follow" />
                <meta name="google-adsense-account" content="ca-pub-9025940068718161" />
                <link rel="canonical" href="https://overcome0.be/markers" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="GoodMap - 모든 목록" />
                <meta
                    property="og:description"
                    content="GoodMap에서 장소 목록을 확인하고, 리뷰를 공유하세요."
                />
                <meta property="og:url" content="https://overcome0.be/markers" />
                <meta property="og:site_name" content="GoodMap" />
                <meta property="og:image" content="https://overcome0.be/goodmap.webp" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </Head>
            <div className="min-h-screen bg-gray-100">
                <header className="bg-gray-800 text-white p-4">
                    <nav className="max-w-6xl mx-auto flex justify-between items-center">
                        <Link href="/" className="text-lg font-bold">
                            GoodMap
                        </Link>
                        <div className="space-x-4">
                            <Link href="/" className="hover:underline">
                                홈
                            </Link>
                            <Link href="/markers" className="hover:underline">
                                목록
                            </Link>
                            <Link href="/about" className="hover:underline">
                                소개
                            </Link>
                            <Link href="/privacy-policy" className="hover:underline">
                                개인정보처리방침
                            </Link>
                        </div>
                    </nav>
                </header>
                <main className="max-w-6xl mx-auto p-4 text-gray-800">
                    <h1 className="text-3xl font-bold mb-4">모든 목록</h1>
                    <p className="mb-6">
                        GoodMap에서 주변 사람들이 공유한 좋은 장소들을 찾아보세요. 아래에서 각
                        장소의 리뷰와 위치 정보를 확인할 수 있습니다.
                    </p>

                    {/* 목차 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">목차</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {markers.map((marker) => (
                                <li key={marker.id}>
                                    <a
                                        href={`#marker-${marker.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {marker.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 마커별 콘텐츠 */}
                    {markers.map((marker) => (
                        <section
                            key={marker.id}
                            id={`marker-${marker.id}`}
                            className="mb-12 border-b pb-6"
                        >
                            <h2 className="text-2xl font-semibold mb-2">{marker.name}</h2>
                            <p className="mb-4">
                                {marker.name}은(는) 주변에서 추천하는 장소로, 편리한 접근성과 다양한 편의시설을
                                제공합니다. 위치: 위도 {marker.latitude}, 경도 {marker.longitude}
                            </p>                            
                            <h3 className="text-xl font-semibold mb-2">리뷰</h3>
                            {marker.posts.length > 0 ? (
                                <ul className="space-y-4">
                                    {marker.posts.map((post) => (
                                        <li key={post.id} className="border p-4 rounded bg-white">
                                            <h4 className="text-lg font-medium">{post.title}</h4>
                                            <p className="text-gray-600">{post.content}</p>
                                            <p className="text-sm text-gray-500">
                                                게시일: {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">이 쉼터에 대한 리뷰가 없습니다.</p>
                            )}
                            <a
                                href="#top"
                                className="mt-4 inline-block text-blue-600 hover:underline"
                            >
                                맨 위로 돌아가기
                            </a>
                        </section>
                    ))}
                </main>
            </div>
        </>
    );
}

export const getServerSideProps = async () => {
    try {
        const markers = await prisma.marker.findMany({
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                posts: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        createdAt: true,
                        likes: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10, // 각 마커당 최대 10개 게시물
                },
            },
        });

        return {
            props: {
                markers: markers.map((marker) => ({
                    ...marker,
                    posts: marker.posts.map((post) => ({
                        ...post,
                        createdAt: post.createdAt.toISOString(),
                    })),
                })),
            },
        };
    } catch (error) {
        console.error("마커 조회 오류:", error);
        return { props: { markers: [] } };
    } finally {
        await prisma.$disconnect();
    }
};
