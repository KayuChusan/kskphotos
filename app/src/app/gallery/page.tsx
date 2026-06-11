import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PhotoGallery } from "@/components/gallery/photo-grid";

export const metadata: Metadata = {
  title: "Gallery",
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
        <p className="eyebrow">Portfolio</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">Gallery</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Browse photos by category, or switch to map view to explore by
          location.
        </p>
      </div>
      <PhotoGallery photos={photos} />
    </div>
  );
}
