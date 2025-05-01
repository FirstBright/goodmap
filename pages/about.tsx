import Navbar from "@/components/Navbar";
import Head from "next/head";

export default function About() {
    return (
        <>
            <Head>
                <title>About GoodMap</title>
                <meta name="description" content="Learn about GoodMap, a community-driven platform for sharing hidden gems." />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            </Head>
            <Navbar />
            <main className="min-h-screen bg-gray-100 py-8 pt-16">
                <section className="w-full max-w-[1080px] mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">About GoodMap</h1>
                    <p className="mb-4 text-gray-800">
                        GoodMap is a platform where users can share and discover hidden places around the world. Our mission is to connect explorers and foster a global community.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">Our Features</h2>
                    <ul className="list-disc pl-5 text-gray-800">
                        <li>Interactive map to explore places.</li>
                        <li>Community-driven content creation.</li>
                        <li>Search and like functionalities.</li>
                    </ul>
                </section>
            </main>
        </>
    );
}