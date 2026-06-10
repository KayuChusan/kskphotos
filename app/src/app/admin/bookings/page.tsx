import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings - Admin | kskphotos",
  description: "依頼管理 - 撮影依頼の確認・ステータス管理を行います。",
};

export default function AdminBookingsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">依頼管理</h1>
      <p className="text-muted-foreground">
        撮影依頼の一覧表示、ステータスの更新、依頼者への連絡などを行います。
      </p>
    </main>
  );
}
