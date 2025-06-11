import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <Html lang="en">
      <Head>
      {isProd && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9025940068718161"
            crossOrigin="anonymous"
          ></script>
        )}
        </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
