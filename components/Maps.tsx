import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"

const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => <div>지도 로딩중...</div>,
})

interface Post {
    id: string
    content: string
    latitude: number
    longitude: number
    createdAt: string
    marker?: {
        name: string
    }
}

interface MapProps {
    posts: Post[]
    onMapClick?: (lat: number, lng: number) => void
}

export default function Maps({ posts, onMapClick }: MapProps) {
    const router = useRouter()
    const [selectedPosition, setSelectedPosition] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleMarkerCreated = () => {
        router.push(router.asPath)
    }

    return (
        <MapComponent
            posts={posts}
            onMapClick={onMapClick}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            handleMarkerCreated={handleMarkerCreated}
        />
    )
}
