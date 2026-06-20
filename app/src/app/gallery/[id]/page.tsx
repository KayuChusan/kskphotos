import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Calendar, Lock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ExifTable } from "@/components/gallery/exif-table";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { pageSeo } from "@/lib/seo";
import { isCollectionUnlocked } from "@/lib/unlock-server";
import { redactPhotoMeta } from "@/lib/photo-visibility";

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

  // 会員限定コレクションは EXIF を説明文に出さず、検索インデックスからも外す
  if (photo.collection?.isLocked) {
    return {
      title: photo.title,
      description: photo.description?.trim() || `${photo.title} — KSK Works`,
      robots: { index: false, follow: false },
      ...pageSeo({
        path: `/gallery/${id}`,
        image: photo.imageUrl,
        type: "article",
      }),
    };
  }

  // EXIF 部品を組み立て、欠損項目を除いてから連結（末尾ダッシュの破綻を防ぐ）
  const exif = [
    photo.lensModel,
    photo.aperture ? `f/${photo.aperture}` : null,
    photo.shutterSpeed ? `${photo.shutterSpeed}s` : null,
    photo.iso ? `ISO ${photo.iso}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const description =
    photo.description?.trim() ||
    (exif ? `${photo.title} — ${exif}` : `${photo.title} — Sony α7R VI で撮影`);
  return {
    title: photo.title,
    description,
    ...pageSeo({
      path: `/gallery/${id}`,
      image: photo.imageUrl,
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

  // 会員限定コレクションは、解錠まで EXIF・現像レシピを出さない
  const gated = photo.collection?.isLocked ?? false;
  const unlocked =
    !gated ||
    (photo.collectionId
      ? await isCollectionUnlocked(photo.collectionId)
      : false);

  // 未解錠の会員限定写真は、ライトボックスのキャプション等からも EXIF を伏せる
  const safe = gated && !unlocked ? redactPhotoMeta(photo) : photo;

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
          <PhotoLightbox photo={safe} />

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

          {gated && !unlocked ? (
            <div className="border border-dashed border-border/60 p-5 text-center">
              <Lock className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                このコレクションは会員限定です。
                <br />
                note メンバーシップの解錠リンクから、EXIF と現像レシピをご覧いただけます。
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="eyebrow mb-4">EXIF Data</h2>
                <ExifTable photo={photo} />
              </div>

              {gated && photo.developNotes && (
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
              {unlocked && (
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
