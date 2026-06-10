import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Admin | kskphotos",
  description: "ブログ記事管理 - 記事の作成・編集・公開管理を行います。",
};

export default function AdminBlogPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">ブログ記事管理</h1>
      <p className="text-muted-foreground">
        ブログ記事の作成、編集、公開・下書きの切り替えなどを行います。
      </p>
    </main>
  );
}
