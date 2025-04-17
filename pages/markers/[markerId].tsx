// pages/markers/[markerId].tsx
import { GetServerSideProps } from "next"
import { PrismaClient } from "@prisma/client"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { useState } from "react"
import PostModal from "@/components/PostModal"
import Head from "next/head"

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className='h-screen flex items-center justify-center'>
            지도 로딩중...
        </div>
    ),
})

interface Post {
    id: string
    title: string
    content: string
    createdAt: string
}

interface Marker {
    id: string
    name: string
    latitude: number
    longitude: number
}

interface Props {
    marker: Marker
    posts: Post[]
}

export default function MarkerPage({ marker, posts }: Props) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(true)

    // Close modal and redirect to home
    const handleClose = () => {
        setIsModalOpen(false)
        router.push("/")
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Place",
        name: marker.name,
        geo: {
            "@type": "GeoCoordinates",
            latitude: marker.latitude,
            longitude: marker.longitude,
        },
        review: posts.map((post) => ({
            "@type": "Review",
            name: post.title,
            reviewBody: post.content,
            datePublished: post.createdAt,
        })),
        url: `https://overcome0.be/markers/${marker.id}`,
    }

    return (
        <>
            <Head>
                <title>{marker.name} - GoodMap</title>
                <meta
                    name='description'
                    content={`Explore posts and share experiences at ${marker.name} on GoodMap.`}
                />
                <meta
                    name='keywords'
                    content={`GoodMap, ${marker.name}, map, posts`}
                />
                <meta name='robots' content='index, follow' />
                <link
                    rel='canonical'
                    href={`https://overcome0.be/markers/${marker.id}`}
                />
                <meta property='og:type' content='website' />
                <meta
                    property='og:title'
                    content={`${marker.name} - GoodMap`}
                />
                <meta
                    property='og:description'
                    content={`Explore posts and share experiences at ${marker.name} on GoodMap.`}
                />
                <meta
                    property='og:url'
                    content={`https://overcome0.be/markers/${marker.id}`}
                />
                <meta property='og:site_name' content='GoodMap' />
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </Head>
            <main className='h-screen'>
                <MapComponent />
                <PostModal
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    markerId={marker.id}
                    markerName={marker.name}
                    initialPosts={posts}
                />
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { markerId } = context.params!
    const prisma = new PrismaClient()

    try {
        // Fetch marker
        const marker = await prisma.marker.findUnique({
            where: { id: markerId as string },
        })

        if (!marker) {
            return { notFound: true }
        }

        // Fetch posts for the marker
        const posts = await prisma.post.findMany({
            where: { markerId: markerId as string },
            orderBy: { createdAt: "desc" },
        })

        return {
            props: {
                marker: {
                    id: marker.id,
                    name: marker.name,
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                },
                posts: posts.map((post) => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    createdAt: post.createdAt.toISOString(),
                })),
            },
        }
    } catch (error) {
        console.error("Error fetching marker/posts:", error)
        return { notFound: true }
    } finally {
        await prisma.$disconnect()
    }
}
