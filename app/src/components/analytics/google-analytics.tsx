import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4。afterInteractive で読み込み、LCP を阻害しない。
 * - NEXT_PUBLIC_GA_ID が空（ローカル/開発）または本番以外では一切出力しない（return null）。
 * - NEXT_PUBLIC_* はビルド時にインライン化されるため、本番ビルド時に値を渡す必要がある。
 * - @next/third-parties は未導入のため next/script で実装。
 */
export function GoogleAnalytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
