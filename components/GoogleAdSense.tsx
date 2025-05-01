import Script from "next/script";

export default function GoogleAdSense({ clientId }: { clientId: string }) {
    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
        />
    );
}