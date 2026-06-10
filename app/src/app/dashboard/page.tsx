import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | kskphotos",
  description: "EXIFダッシュボード - 撮影データの統計・分析を確認できます。",
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">EXIFダッシュボード</h1>
      <p className="text-muted-foreground">
        撮影データの統計情報を可視化します。レンズ使用率、焦点距離分布、撮影時間帯などを分析できます。
      </p>
    </main>
  );
}
