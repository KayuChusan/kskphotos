import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MotionProvider } from "@/components/motion-provider";
import { SpeculationRules } from "@/components/speculation-rules";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 欧文見出し — 丸みのあるソフトなセリフ
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// 和文は OS 標準フォント（ヒラギノ/Noto Sans JP 等）を使う。
// next/font で日本語 Web フォントを self-host すると @font-face が数百個・約445KiB の
// レンダリングブロック CSS になり、低速回線で FCP/LCP を大きく悪化させるため不採用。
// フォールバック指定は globals.css の --font-sans / --font-heading に集約。

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kskworks.jp";
const siteDescription =
  "KSK Works — 出張撮影・ポートレート。家族写真・七五三からプロフィール・イベント撮影、政治・選挙写真まで、神奈川を拠点に全国で承ります（出張はご相談ください）。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KSK Works — 出張撮影・ポートレート",
    template: "%s | KSK Works",
  },
  description: siteDescription,
  applicationName: "KSK Works",
  keywords: [
    "出張撮影",
    "ポートレート",
    "家族写真",
    "七五三",
    "プロフィール写真",
    "イベント撮影",
    "選挙ポスター",
    "政治 写真",
    "全国出張",
    "神奈川",
    "東京",
    "フォトグラファー",
  ],
  authors: [{ name: "KSK Works" }],
  creator: "KSK Works",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "KSK Works",
    title: "KSK Works — 出張撮影・ポートレート",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "KSK Works — 出張撮影・ポートレート",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// 出張撮影＝地域ビジネスのローカルSEO向け構造化データ
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "KSK Works",
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  email: "info@kskworks.jp",
  // 居住地は神奈川、出張撮影は全国対応
  address: {
    "@type": "PostalAddress",
    addressRegion: "神奈川県",
    addressCountry: "JP",
  },
  areaServed: ["日本"],
  serviceType: [
    "出張撮影",
    "ポートレート撮影",
    "イベント撮影",
    "Web制作・IT サポート",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="ja"
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <div aria-hidden className="bg-aurora" />
          <SpeculationRules />
          <MotionProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </MotionProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
