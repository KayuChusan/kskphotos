import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Calendar, Download, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ExifTable } from "@/components/gallery/exif-table";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { pageSeo } from "@/lib/seo";
import { isMember } from "@/lib/unlock-server";
import { maskPhotoImage, redactShootingMeta } from "@/lib/photo-visibility";
import { LockedTile } from "@/components/gallery/locked-tile";
import { MemberGate } from "@/components/member-gate";

interface Props {
  params: Promise<{ id: string }>;
}

// 会員解錠状態（Cookie）をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
    select: { id: true },
  });
  return photos.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { collection: true },
  });
  if (!photo) return { title: "Not Found" };

  // EXIF（撮影設定）は全写真で会員限定のため、説明文・OGP には出さない（クローラ＝非会員）。
  const locked = photo.collection?.isLocked ?? false;
  const description =
    photo.description?.trim() || `${photo.title} — Sony α7R VI で撮影`;
  return {
    title: photo.title,
    description,
    // 会員限定コレクションは検索インデックスからも外す
    ...(locked ? { robots: { index: false, follow: false } } : {}),
    ...pageSeo({
      path: `/gallery/${id}`,
      // 会員限定コレクションは OG に本画像を出さない
      image: locked ? undefined : photo.imageUrl,
      type: "article",
    }),
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  PORTRAIT: "Portrait",
  LANDSCAPE: "Landscape",
  EVENT: "Event",
  STREET: "Street",
  ARCHITECTURE: "Architecture",
  FOOD: "Food",
  OTHER: "Other",
};

export default async function PhotoDetailPage({ params }: Props) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { collection: true },
  });
  if (!photo || !photo.isPublished) notFound();

  // EXIF（撮影設定）は全写真で会員限定。会員限定コレクションは本画像もマスク。
  const lockedCollection = photo.collection?.isLocked ?? false;
  const member = await isMember();
  const masked = lockedCollection && !member; // 本画像のマスク（会員限定コレクション×非会員）
  const safe = masked
    ? maskPhotoImage(photo)
    : member
      ? photo
      : redactShootingMeta(photo); // 公開写真の非会員：画像・位置は出し撮影設定だけ伏せる

  const dt = safe.dateTaken;
  const dateTaken = dt
    ? new Date(dt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/gallery"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        ギャラリーに戻る
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {masked ? (
            <LockedTile
              blurDataUrl={safe.blurDataUrl}
              width={safe.imageWidth}
              height={safe.imageHeight}
              className="viewfinder mx-auto max-h-[75vh] w-full"
            />
          ) : (
            <PhotoLightbox photo={safe} />
          )}

          {/* before 画像 URL は safe では伏せるため、有無の判定は元データで行う
              （URL は出力せず /compare へ誘導するだけ。非会員は compare 側で会員案内） */}
          {photo.beforeUrl && (
            <div className="mt-5 text-center">
              <Link
                href={`/gallery/${photo.id}/compare`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "font-mono text-[10px] uppercase tracking-[0.15em]"
                )}
              >
                <span className="text-safelight">RAW</span>
                &nbsp;ビフォーアフターを見る
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-4xl font-medium">{photo.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">
                {CATEGORY_LABELS[photo.category] ?? photo.category}
              </Badge>
              {dateTaken && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {dateTaken}
                </span>
              )}
            </div>
            {photo.description && (
              <p className="mt-3 text-sm text-muted-foreground">
                {photo.description}
              </p>
            )}
          </div>

          {photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {photo.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="mr-1 size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {!member ? (
            <MemberGate message="撮影設定（EXIF）は会員限定です。note メンバーシップに参加すると、EXIF・現像レシピの閲覧と高画素（4096px）ダウンロードができます。" />
          ) : (
            <>
              <div>
                <h2 className="eyebrow mb-4">EXIF Data</h2>
                <ExifTable photo={photo} />
              </div>

              {photo.developNotes && (
                <>
                  <Separator />
                  <div>
                    <h2 className="eyebrow mb-3">現像レシピ</h2>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {photo.developNotes}
                    </p>
                  </div>
                </>
              )}

              {photo.originalUrl && (
                <>
                  <Separator />
                  <div>
                    <h2 className="eyebrow mb-3">High-Res Download</h2>
                    <a
                      href={`/gallery/${photo.id}/download`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                      download
                    >
                      <Download className="size-4" />
                      高画素（4096px）をダウンロード
                    </a>
                    <p className="exif-text mt-2 text-muted-foreground/60">
                      会員特典 — 個人利用の範囲でお使いください
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          <Separator />

          {/* 撮影来歴 — 生成AI不使用の表明 */}
          <div className="border border-border/60 p-4">
            <h2 className="eyebrow mb-3">
              <BadgeCheck className="mr-1.5 inline size-3.5 text-safelight" />
              Authenticity
            </h2>
            <ul className="exif-text space-y-1.5 text-muted-foreground">
              {member && (
                <li>Captured on {safe.cameraModel ?? "Sony α7R VI"}</li>
              )}
              {dateTaken && <li>Shot on {dateTaken}</li>}
              <li>Developed in Adobe Lightroom</li>
              <li className="text-foreground/80">
                No generative AI — 生成AIは使用していません
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
