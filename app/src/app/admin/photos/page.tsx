import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photos - Admin | kskphotos",
  description: "写真管理 - 写真のアップロード・編集・削除を行います。",
};

export default function AdminPhotosPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">写真管理</h1>
      <p className="text-muted-foreground">
        写真のアップロード、メタデータの編集、公開・非公開の切り替えなどを行います。
      </p>
    </main>
  );
}
