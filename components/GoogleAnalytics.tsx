"use client"
import Script from "next/script"

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
    return (
        <>
            <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
                id="google-consent-mode"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('consent', 'default', {
                          'analytics_storage': 'denied',
                          'ad_storage': 'denied',
                          'ad_user_data': 'denied',
                          'ad_personalization': 'denied',
                          'region': ['EEA']
                        });
                    `,
                }}
            />
            <Script
                id='google-analytics'
                strategy='afterInteractive'
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${gaId}', { page_path: window.location.pathname });
                    `,
                }}
            />
        </>
    )
}
