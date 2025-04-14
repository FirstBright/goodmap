"use client"

import { useState, useEffect, useRef } from "react"
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import CreateMarkerModal from "./CreateMarkerModal"
import PostModal from "./PostModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

L.Icon.Default.prototype.options.iconUrl = ""
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface MarkerData {
    id: string
    name: string
    latitude: number
    longitude: number
}

export default function MapComponent() {
    const [markers, setMarkers] = useState<MarkerData[]>([])
    const [filteredMarkers, setFilteredMarkers] = useState<MarkerData[]>([])
    const [selectedPosition, setSelectedPosition] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedMarker, setSelectedMarker] = useState<{
        id: string
        name: string
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const mapRef = useRef<L.Map | null>(null)
    const [mapState, setMapState] = useState<{
        lat: number
        lng: number
        zoom: number
    }>(() => {
        if (typeof window === "undefined") {
            return { lat: 37.5665, lng: 126.978, zoom: 13 }
        }
        try {
            const saved = localStorage.getItem("mapState")
            if (saved) {
                const parsed = JSON.parse(saved)
                if (
                    typeof parsed.lat === "number" &&
                    typeof parsed.lng === "number" &&
                    typeof parsed.zoom === "number"
                ) {
                    console.log("Loaded map state from localStorage:", parsed)
                    return parsed
                }
            }
        } catch (err) {
            console.error("Error parsing localStorage mapState:", err)
        }
        return { lat: 37.5665, lng: 126.978, zoom: 13 }
    })

    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                setIsLoading(true)
                console.log("Fetching markers from /api/markers")
                const response = await fetch("/api/markers", { method: "GET" })
                console.log("GET /api/markers status:", response.status)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                console.log("Fetched markers:", data)
                setMarkers(data)
                setFilteredMarkers(data)
            } catch (err) {
                console.error("Error fetching markers:", err)
                setError("마커 데이터를 불러오지 못했습니다.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchMarkers()
    }, [])

    useEffect(() => {
        if (mapRef.current) {
            console.log("Map initialized:", mapRef.current.getCenter())
            mapRef.current.invalidateSize() // Fix map sizing issues
        }
    }, [])

    // 마커 검색 기능
    useEffect(() => {
        const filtered = markers.filter((marker) =>
            marker.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredMarkers(filtered)
    }, [searchQuery, markers])

    const MapClickHandler = () => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng
                console.log("Map clicked at:", { lat, lng })
                setSelectedPosition({ lat, lng })
                setIsCreateModalOpen(true)
            },
            moveend() {
                const center = map.getCenter()
                const zoom = map.getZoom()
                const newState = { lat: center.lat, lng: center.lng, zoom }
                console.log("Map moved to:", newState)
                try {
                    localStorage.setItem("mapState", JSON.stringify(newState))
                    console.log("Saved map state to localStorage:", newState)
                    setMapState(newState)
                } catch (err) {
                    console.error("Error saving to localStorage:", err)
                }
            },
        })
        if (!mapRef.current) {
            mapRef.current = map
        }
        return null
    }
    const MapFocus = () => {
        const map = useMap()
        if (filteredMarkers.length === 1) {
            const { latitude, longitude } = filteredMarkers[0]
            map.setView([latitude, longitude], 13)
        }
        return null
    }

    const handleMarkerCreated = async () => {
        try {
            console.log("Refreshing markers from /api/markers")
            const response = await fetch("/api/markers", { method: "GET" })
            console.log("GET /api/markers status:", response.status)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setMarkers(data)
        } catch (err) {
            console.error("Error refreshing markers:", err)
            setError("마커 목록을 갱신하지 못했습니다.")
        }
    }
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }
    const clearSearch = () => {
        setSearchQuery("")
        setFilteredMarkers(markers)
    }
    if (isLoading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                로딩중...
            </div>
        )
    }

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center text-red-500'>
                {error}
            </div>
        )
    }

    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100 '>
            {/* 검색창 */}
            <div className='w-full max-w-[1080px] px-4 py-4 flex justify-center items-center gap-2 bg-white shadow-md z-[1000] sm:px-6'>
                <div className='flex items-center gap-2 w-full sm:w-auto'>
                    <Input
                        type='text'
                        placeholder='장소 이름으로 검색...'
                        value={searchQuery}
                        onChange={handleSearch}
                        className='w-full sm:w-96'
                    />
                    {searchQuery && (
                        <Button variant='outline' onClick={clearSearch}>
                            초기화
                        </Button>
                    )}
                </div>
            </div>

            {/* 지도 */}
            <div className='w-full max-w-[1080px] h-[600px] relative my-4 mx-auto px-4 sm:px-0'>
                {typeof window !== "undefined" && (
                    <MapContainer
                        center={[mapState.lat, mapState.lng]}
                        zoom={mapState.zoom}
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                        className='rounded-lg shadow-md'
                        ref={mapRef}
                    >
                        <TileLayer
                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapClickHandler />
                        <MapFocus />
                        {filteredMarkers.map((marker) => (
                            <Marker
                                key={marker.id}
                                position={[marker.latitude, marker.longitude]}
                                eventHandlers={{
                                    click: () => {
                                        console.log("Marker clicked:", marker)
                                        setSelectedMarker({
                                            id: marker.id,
                                            name: marker.name,
                                        })
                                    },
                                }}
                            />
                        ))}
                    </MapContainer>
                )}
            </div>

            <CreateMarkerModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    console.log("Closing CreateMarkerModal")
                    setIsCreateModalOpen(false)
                    setSelectedPosition(null)
                }}
                position={selectedPosition || { lat: 0, lng: 0 }}
                onMarkerCreated={handleMarkerCreated}
            />

            {selectedMarker && (
                <PostModal
                    isOpen={!!selectedMarker}
                    onClose={() => {
                        console.log("Closing PostModal")
                        setSelectedMarker(null)
                    }}
                    markerId={selectedMarker.id}
                    markerName={selectedMarker.name}
                />
            )}
        </div>
    )
}
