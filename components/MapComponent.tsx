'use client';

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CreateMarkerModal from "./CreateMarkerModal";
import PostModal from "./PostModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapComponent() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MarkerData[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<{ id: string; name: string } | null>(null);
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching markers from /api/markers");
        const response = await fetch("/api/markers", { method: "GET" });
        console.log("GET /api/markers status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched markers:", data);
        setMarkers(data);
        setFilteredMarkers(data)
      } catch (err) {
        console.error("Error fetching markers:", err);
        setError("마커 데이터를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  // 로컬스토리지에서 마지막 위치 복원
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("lastPosition");
      if (savedPosition) {
        setLastPosition(JSON.parse(savedPosition));
      }
    }
  }, []);

  // Leaflet 아이콘 설정
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);
  
  // 마커 검색 기능
  useEffect(() => {
    const filtered = markers.filter((marker) =>
      marker.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMarkers(filtered);
  }, [searchQuery, markers]);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        e.originalEvent.stopPropagation();
        const { lat, lng } = e.latlng;
        console.log("Map clicked at:", { lat, lng });
        setSelectedPosition({ lat, lng });
        setIsCreateModalOpen(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("lastPosition", JSON.stringify({ lat, lng }));
        }
      },
    });
    return null;
  };
  const MapFocus = () => {
    const map = useMap();
    if (filteredMarkers.length ===1) {
      const {latitude, longitude} = filteredMarkers[0];
      map.setView([latitude, longitude], 13);
    }
    return null;
  };

  const handleMarkerCreated = async () => {
    try {
        console.log("Refreshing markers from /api/markers");
        const response = await fetch("/api/markers", { method: "GET" });
        console.log("GET /api/markers status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMarkers(data);
    } catch (err) {
      console.error("Error refreshing markers:", err);
      setError("마커 목록을 갱신하지 못했습니다.");
    }
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredMarkers(markers);
  };
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">마커 로딩중...</div>;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full flex flex-col">
      {/* 검색창 */}
      <div className="p-4 flex items-center gap-2 z-[1000] bg-white shadow-md">
        <Input
          type="text"
          placeholder="장소 이름으로 검색..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-md"
        />
        {searchQuery && (
          <Button variant="outline" onClick={clearSearch}>
            초기화
          </Button>
        )}
      </div>

      {/* 지도 */}
      <div className="flex-1 relative">
        {typeof window !== "undefined" && (
          <MapContainer
            center={lastPosition || [37.5665, 126.978]}
            zoom={13}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                    console.log("Marker clicked:", marker);
                    setSelectedMarker({ id: marker.id, name: marker.name });
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
          console.log("Closing CreateMarkerModal");
          setIsCreateModalOpen(false);
          setSelectedPosition(null);
        }}
        position={selectedPosition || { lat: 0, lng: 0 }}
        onMarkerCreated={handleMarkerCreated}
      />

      {selectedMarker && (
        <PostModal
          isOpen={!!selectedMarker}
          onClose={() => {
            console.log("Closing PostModal");
            setSelectedMarker(null);
          }}
          markerId={selectedMarker.id}
          markerName={selectedMarker.name}
        />
      )}
    </div>
  );
}