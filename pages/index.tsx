import dynamic from "next/dynamic";


const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">지도 로딩중...</div>,
});

export default function Home() {
  return (
    <main className="h-screen">
      <MapComponent/>
    </main>
  );
}
