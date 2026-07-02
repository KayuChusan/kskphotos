import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { maskForViewer } from "@/lib/photo-visibility";
import { isMember } from "@/lib/unlock-server";
import { PhotoGallery } from "@/components/gallery/photo-grid";
import { JaText } from "@/components/ui/ja-text";
import { PageTitle } from "@/components/ui/page-title";

export const metadata: Metadata = {
  ...pageSeo({ path: "/gallery" }),
  title: "ギャラリー",
  description:
    "フォトギャラリー — ポートレート、風景、イベント、ストリートスナップ。GPS地図ビューでも閲覧可能。",
};

// 解錠状態(Cookie)をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  // EXIF(撮影設定)は全写真で会員限定。非会員は撮影設定を伏せ、会員限定コレクションは
  // 本画像もマスク。地図用の位置情報は残す。
  const [rows, member] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: { collection: { select: { title: true, isLocked: true } } },
    }),
    isMember(),
  ]);
  const photos = rows.map((p) => maskForViewer(p, member));

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 扉 — トップのタイポグラフィに合わせた機能的なタイトル（コピーで盛らない） */}
      <div className="mb-12">
        <PageTitle en="Gallery" title="ギャラリー" />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-xl text-sm leading-relaxed text-foreground-soft">
            <JaText>
              カテゴリーで絞り込み、地図ビューで撮影場所からたどれます。
            </JaText>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {photos.length} FRAMES — MAP READY
          </p>
        </div>
      </div>
      <PhotoGallery photos={photos} />
    </div>
  );
}
