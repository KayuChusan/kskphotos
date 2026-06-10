import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo | kskphotos",
  description: "写真詳細 - 撮影データやEXIF情報を確認できます。",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PhotoDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">写真詳細</h1>
      <p className="text-muted-foreground">
        写真ID: {id} の詳細ページです。EXIF情報や撮影データを表示します。
      </p>
    </main>
  );
}
