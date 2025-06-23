import { GetStaticProps, GetStaticPaths } from "next";
import { prisma } from "@/lib/prisma"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { useState } from "react"
import PostModal from "@/components/PostModal"
import Head from "next/head"

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className='h-screen flex flex-col items-center justify-center bg-gray-100'>
            <div className='w-full max-w-[1080px] px-4 sm:px-6 text-center'>                
                <p className='text-lg text-gray-600 mb-6'>
                    Explore posts and share experiences at this location on GoodMap.
                </p>
                <div className='space-y-4'>
                    <div className='animate-pulse w-3/4 h-6 bg-gray-200 rounded mx-auto' />
                    <div className='animate-pulse w-1/2 h-4 bg-gray-200 rounded mx-auto' />
                    <div className='animate-pulse w-2/3 h-4 bg-gray-200 rounded mx-auto' />
                </div>
            </div>
        </div>
    ),
})

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
        description: `Explore posts and share experiences at ${marker.name} on GoodMap.`,
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
            author: {
                "@type": "Person",
                name: "Anonymous",
            },
        })),
        url: `https://overcome0.be/markers/${marker.id}`,
        image: "https://overcome0.be/goodmap.webp",
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
                <meta property="og:image" content="https://overcome0.be/goodmap.webp" />
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </Head>
            <main className='h-screen'>
                <div className='hidden'>
                    <h1>{marker.name}</h1>
                    <p>Explore posts at {marker.name}:</p>
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id}>
                                <h1 className="mb-2 text-xl font-semibold">
                                    {post.title}
                                </h1>
                                <p>
                                    {post.content}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
    try {
        const markerId = params!.markerId as string;
        const marker = await prisma.marker.findUnique({
            where: { id: markerId },
        });

        if (!marker) {
            return { notFound: true };
        }

        const posts = await prisma.post.findMany({
            where: { markerId },
            orderBy: { createdAt: "desc" },
            take: 10, // Limit to 10 posts to reduce load
        });

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
                    likes: post.likes,
                })),
            },
            revalidate: 60, // Revalidate every 60 seconds
        };
    } catch (error) {
        console.error("Error fetching marker/posts:", error);
        return { notFound: true };
    } finally {
        await prisma.$disconnect();
    }
};

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [], // Pre-render no paths at build time
        fallback: "blocking", // Generate pages on-demand
    };
};
