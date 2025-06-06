import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
export default function Document() {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <Html lang="en">
      <Head>
      {isProd && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9025940068718161"
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
