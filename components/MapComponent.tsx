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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import { getLanguageText } from "@/utils/language"
import { log } from "@/utils/logger";

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
    tags: string[]
}

interface Tag {
    value: string
    label: string
}

const getAvailableTags = (isKorean: boolean): Tag[] => [
    { value: "restaurant", label: isKorean ? "음식점" : "Restaurant" },
    { value: "accommodation", label: isKorean ? "숙박" : "Accommodation" },
    { value: "tourism_view", label: isKorean ? "관광/뷰" : "Tourism/View" },
    { value: "cafe", label: isKorean ? "카페" : "Cafe" },
    { value: "shopping", label: isKorean ? "쇼핑" : "Shopping" },
    { value: "incident", label: isKorean ? "사건" : "Incident" },
    { value: "other", label: isKorean ? "기타" : "Other" },
];

export default function MapComponent() {
    const [markers, setMarkers] = useState<MarkerData[]>([])
    const [filteredMarkers, setFilteredMarkers] = useState<MarkerData[]>([])
    const [selectedPosition, setSelectedPosition] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const mapRef = useRef<L.Map | null>(null)
    const router = useRouter()
    const text = getLanguageText()
    const isKorean = typeof window !== "undefined" && navigator.language.startsWith("ko");
    const AVAILABLE_TAGS = getAvailableTags(isKorean)

    const [mapState] = useState<{
        lat: number
        lng: number
        zoom: number
    }>(() => {
        if (typeof window === "undefined") {
            return { lat: 37.5238, lng: 126.9266, zoom: 13 }
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
                    log("Loaded map state from localStorage:", parsed)
                    return parsed
                }
            }
        } catch (err) {
            console.error("Error parsing localStorage mapState:", err)
        }
        return { lat: 37.5238, lng: 126.9266, zoom: 13 }
    })

    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                setIsLoading(true)
                log("Fetching markers from /api/markers")
                const response = await fetch("/api/markers", { method: "GET" })
                log("GET /api/markers status:", response.status)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                log("Fetched markers:", data)
                setMarkers(data)
                setFilteredMarkers(data)
            } catch (err) {
                console.error("Error fetching markers:", err)
                setError(text.errorLoadingMarkers)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMarkers()
    }, [text.errorLoadingMarkers])

    useEffect(() => {
        if (mapRef.current) {
            log("Map initialized:", mapRef.current.getCenter())
            mapRef.current.invalidateSize() // Fix map sizing issues
        }
    }, [])

    // 마커 검색 기능
    useEffect(() => {
        let filtered = markers
        if (searchQuery) {
            filtered = filtered.filter((marker) =>
                marker.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedTags.length > 0) {
            filtered = filtered.filter((marker) =>
                selectedTags.every((tag) => marker.tags.includes(tag))
            );
        }
        setFilteredMarkers(filtered)
    }, [searchQuery, selectedTags, markers])

    const MapClickHandler = () => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng
                log("Map clicked at:", { lat, lng })
                setSelectedPosition({ lat, lng })
                setIsCreateModalOpen(true)
            },
            moveend() {
                const center = map.getCenter()
                const zoom = map.getZoom()
                const newState = { lat: center.lat, lng: center.lng, zoom }
                log("Map moved to:", newState)
                try {
                    localStorage.setItem("mapState", JSON.stringify(newState))
                    log("Saved map state to localStorage:", newState)
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
            log("Refreshing markers from /api/markers")
            const response = await fetch("/api/markers", { method: "GET" })
            log("GET /api/markers status:", response.status)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setMarkers(data)
            setFilteredMarkers(data)
        } catch (err) {
            console.error("Error refreshing markers:", err)
            setError(text.errorLoadingMarkers)
        }
    }
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }
    const clearSearch = () => {
        setSearchQuery("")
        setFilteredMarkers(markers)
    }
    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };
    if (isLoading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                {text.loading}
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
        <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100 py-8'>
            {/* 검색창 */}
            <div className='w-full max-w-[1080px] px-4 py-4 bg-gray-100 shadow-md z-[1000] sm:px-6 flex flex-col items-center'>
                <div className='flex gap-2 w-full sm:w-auto mb-6'>
                    <Input
                        type='text'
                        placeholder={text.searchPlaceholder}
                        value={searchQuery}
                        onChange={handleSearch}
                        className='w-full sm:w-96 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500'
                    />
                    {searchQuery && (
                        <Button variant='outline' onClick={clearSearch} className="rounded-lg">
                            {text.reset}
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                        <Button
                            key={tag.value}
                            variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                            onClick={() => toggleTag(tag.value)}
                            className={`text-sm rounded-full px-4 py-1 transition-colors ${
                                selectedTags.includes(tag.value)
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {tag.label}
                        </Button>
                    ))}
                    {selectedTags.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setSelectedTags([])}
                            className="text-sm rounded-full px-4 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                            {text.resetTags}
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
                                        log("Marker clicked:", marker)
                                        router.push(`/markers/${marker.id}`)
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
                    log("Closing CreateMarkerModal")
                    setIsCreateModalOpen(false)
                    setSelectedPosition(null)
                }}
                position={selectedPosition || { lat: 0, lng: 0 }}
                onMarkerCreated={handleMarkerCreated}
            />
        </div>
    )
}
