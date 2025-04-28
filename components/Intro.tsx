import { motion } from "framer-motion";

export default function Intro({ onContinentSelect }: { onContinentSelect: (lat: number, lng: number) => void }) {

    interface Continent {
        name: string
        lat: number
        lng: number
        latRange: number
        lngRange: number
    }

    const continents = [
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-300 to-purple-400"
        >
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl font-bold text-white mb-6"
            >
                Welcome to GoodMap!
            </motion.h1>
            <motion.p
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg text-white mb-8"
            >
                Find hidden places around the world. Select a continent to start!
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
                {continents.map((continent) => (
                    <motion.button
                        key={continent.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => selectContinent(continent)}
                        className="px-6 py-3 bg-white text-black rounded-lg shadow-md hover:bg-gray-200"

                    >
                        {continent.name}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}