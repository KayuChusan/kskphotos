import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | kskphotos",
  description: "管理ダッシュボード - サイト全体の管理画面です。",
};

export default function AdminDashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">管理ダッシュボード</h1>
      <p className="text-muted-foreground">
        写真、予約、ブログ記事などサイト全体の管理を行います。
      </p>
    </main>
  );
}
