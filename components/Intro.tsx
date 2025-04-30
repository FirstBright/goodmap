import { motion } from "framer-motion";
import { getLanguageText } from "@/utils/language";

interface Continent {
    name: string
    lat: number
    lng: number
    latRange: number
    lngRange: number
}

export default function Intro({ onContinentSelect }: { onContinentSelect: (lat: number, lng: number) => void }) {

    const text = getLanguageText();

    const continents: Continent[] = [
        { name: "North America", lat: 40, lng: -100, latRange: 15, lngRange: 20 },
        { name: "South America", lat: -15, lng: -60, latRange: 10, lngRange: 10 },
        { name: "Europe", lat: 50, lng: 10, latRange: 10, lngRange: 20 },
        { name: "Asia", lat: 30, lng: 100, latRange: 20, lngRange: 30 },
        { name: "Africa", lat: 0, lng: 20, latRange: 15, lngRange: 15 },
        { name: "Oceania", lat: -25, lng: 135, latRange: 10, lngRange: 20 },
    ]

    const selectContinent = (continent: Continent) => {
        const lat = continent.lat + (Math.random() - 0.5) * 2 * continent.latRange
        const lng = continent.lng + (Math.random() - 0.5) * 2 * continent.lngRange
        onContinentSelect(lat, lng)
    }

    const tutorialSteps = [
        {
            title: text.searchPlaceholder, // "장소 이름으로 검색..." 또는 "Search by place name..."
            description: text.searchPlaceholder === "장소 이름으로 검색..."
                ? "원하는 장소를 검색하여 커뮤니티가 공유한 숨겨진 명소를 찾아보세요!"
                : "Search for places to discover hidden gems shared by the community!",
        },
        {
            title: text.writePost, // "글 작성" 또는 "Write Post"
            description: text.writePost === "글 작성"
                ? "지도 위에서 클릭하여 나만의 장소를 추가하고 이야기를 공유하세요."
                : "Click on the map to add your own place and share your story.",
        },
        {
            title: text.like, // "좋아요" 또는 "Like"
            description: text.like === "좋아요"
                ? "마음에 드는 장소에 좋아요를 눌러 커뮤니티와 함께 즐기세요!"
                : "Like your favorite places to engage with the community!",
        },
    ];

    return (
        <div className="flex flex-col justify-center items-center min-h-screen ">

            <div className="w-full max-w-[1080px] flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 px-4">
                <h1 className="text-2xl sm:text-5xl font-bold text-white mb-6 sm:mb-10 will-change-transform">
                    {text.searchPlaceholder === "장소 이름으로 검색..."
                        ? "GoodMap에 오신 것을 환영합니다!"
                        : "Welcome to GoodMap!"}
                </h1>
                <p className="text-base sm:text-lg text-white mb-4 text-center max-w-2xl">
                    {text.searchPlaceholder === "장소 이름으로 검색..."
                        ? "GoodMap은 누구나 자유롭게 숨겨진 장소를 공유하고 탐험할 수 있는 커뮤니티 지도입니다! 대륙을 선택하여 지금 시작하세요."
                        : "GoodMap is a community map where anyone can freely share and explore hidden places! Select a continent to get started."}
                </p>
                <div className="hidden sm:grid mb-8 grid-cols-3 gap-4 max-w-4xl w-full">
                    {tutorialSteps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg text-center text-gray-800 bg-opacity-50 rounded-lg shadow-md"
                        >
                            <h3 className="font-semibold mb-3">{step.title}</h3>
                            <p className="text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
                    {continents.map((continent, index) => (
                        <motion.div
                            key={continent.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-white text-gray-800 rounded-lg shadow-md hover:bg-gray-200 text-center"
                            onClick={() => selectContinent(continent)}
                        >
                            {continent.name}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}