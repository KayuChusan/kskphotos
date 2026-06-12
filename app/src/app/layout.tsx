import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "KSK Works — 出張撮影・ポートレート",
    template: "%s | KSK Works",
  },
  description:
    "KSK Works — 出張撮影・ポートレート。家族写真・七五三からプロフィール・イベント撮影まで、神奈川・東京を中心に承ります。",
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
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
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
