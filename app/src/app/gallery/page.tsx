import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | kskphotos",
  description: "フォトギャラリー - 撮影した写真の一覧をご覧いただけます。",
};

export default function GalleryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">フォトギャラリー</h1>
      <p className="text-muted-foreground">
        撮影した写真の一覧です。カテゴリやタグで絞り込みができます。
      </p>
    </main>
  );
}
