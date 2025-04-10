import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import CreateMarkerModal from "./CreateMarkerModal"

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

interface MapComponentProps {
    posts: Post[]
    onMapClick?: (lat: number, lng: number) => void
    selectedPosition: { lat: number; lng: number } | null
    setSelectedPosition: (position: { lat: number; lng: number } | null) => void
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    handleMarkerCreated: () => void
}

interface MapClickEvent {
    latlng: {
        lat: number
        lng: number
    }
}

export default function MapComponent({
    posts,
    onMapClick,
    selectedPosition,
    setSelectedPosition,
    isModalOpen,
    setIsModalOpen,
    handleMarkerCreated,
}: MapComponentProps) {
    const handleMapClick = (e: MapClickEvent) => {
        const { lat, lng } = e.latlng
        setSelectedPosition({ lat, lng })
        setIsModalOpen(true)
        onMapClick?.(lat, lng)
    }

    return (
        <>
            <MapContainer
                center={[37.5665, 126.978]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {posts.map((post) => (
                    <Marker
                        key={post.id}
                        position={[post.latitude, post.longitude]}
                    >
                        <Popup>
                            <div>
                                <h3 className='font-bold'>
                                    {post.marker?.name || "이름 없음"}
                                </h3>
                                <p>{post.content}</p>
                                <p className='text-sm text-gray-500'>
                                    {new Date(post.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                <MapClickHandler onClick={handleMapClick} />
            </MapContainer>

            <CreateMarkerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                position={selectedPosition || { lat: 0, lng: 0 }}
                onMarkerCreated={handleMarkerCreated}
            />
        </>
    )
}

function MapClickHandler({ onClick }: { onClick: (e: MapClickEvent) => void }) {
    useMapEvents({
        click: onClick,
    })
    return null
}
