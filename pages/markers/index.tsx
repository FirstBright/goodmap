// pages/markers/index.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Head from "next/head"

interface Marker {
    id: string
    name: string
    latitude: number
    longitude: number
}
interface Props {
    markers: Marker[]
}

export default function MarkersPage({ markers }: Props) {
    return (
        <>
            <Head>
                <title>Markers</title>
                <meta name='robots' content='index, follow'></meta>
            </Head>
            <div>
                <h1>All Markers</h1>
                <ul>
                    {markers.map((marker) => (
                        <li key={marker.id}>
                            <Link href={`/markers/${marker.id}`}>
                                {marker.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export const getServerSideProps = async () => {
    const markers = await prisma.marker.findMany({
        select: { id: true, name: true },
    })
    return { props: { markers } }
}
