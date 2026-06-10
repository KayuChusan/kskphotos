import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | kskphotos",
  description: "プロフィール - フォトグラファーの自己紹介と使用機材について。",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">プロフィール</h1>
      <p className="text-muted-foreground">
        フォトグラファーの自己紹介ページです。経歴や使用機材、撮影スタイルについてご紹介します。
      </p>
    </main>
  );
}
