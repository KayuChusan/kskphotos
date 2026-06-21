import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { maskForViewer } from "@/lib/photo-visibility";
import { getUnlockedCollectionIds } from "@/lib/unlock-server";
import { PhotoGallery } from "@/components/gallery/photo-grid";

export const metadata: Metadata = {
  ...pageSeo({ path: "/gallery" }),
  title: "ギャラリー",
  description:
    "フォトギャラリー — ポートレート、風景、イベント、ストリートスナップ。GPS地図ビューでも閲覧可能。",
};

// 解錠状態(Cookie)をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  // 会員限定コレクションの写真も除外せず取得し、未解錠ならモザイク表示する
  const [rows, unlockedIds] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: { collection: { select: { title: true, isLocked: true } } },
    }),
    getUnlockedCollectionIds(),
  ]);
  const unlocked = new Set(unlockedIds);
  const photos = rows.map((p) => maskForViewer(p, unlocked));

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
