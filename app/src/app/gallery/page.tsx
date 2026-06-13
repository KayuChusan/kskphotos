import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PhotoGallery } from "@/components/gallery/photo-grid";

export const metadata: Metadata = {
  title: "ギャラリー",
  description:
    "フォトギャラリー — ポートレート、風景、イベント、ストリートスナップ。GPS地図ビューでも閲覧可能。",
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">ギャラリー</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          カテゴリーで絞り込んだり、地図ビューで撮影場所から写真をたどることもできます。
        </p>
      </div>
      <PhotoGallery photos={photos} />
    </div>
  );
}
