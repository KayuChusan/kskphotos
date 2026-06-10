import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | kskphotos",
  description: "ブログ一覧 - 撮影日記やカメラ・レンズのレビュー記事。",
};

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">ブログ</h1>
      <p className="text-muted-foreground">
        撮影日記やカメラ・レンズのレビュー、撮影テクニックに関する記事の一覧です。
      </p>
    </main>
  );
}
