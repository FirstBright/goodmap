// pages/markers/index.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"

interface Marker {
    id: string
    name: string
    latitude: number
    longitude: number
}
interface Props {
    markers: Marker[]
}

export default function MarkersPage({ markers}: Props ) {
    return (
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
    )
}

export const getServerSideProps = async () => {
    const markers = await prisma.marker.findMany({
        select: { id: true, name: true },
    })
    return { props: { markers } }
}
