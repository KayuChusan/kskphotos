import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CompareSlider } from "@/components/gallery/compare-slider";
import { ExifTable } from "@/components/gallery/exif-table";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { pageSeo } from "@/lib/seo";
import { isCollectionUnlocked } from "@/lib/unlock-server";
import { LockedTile } from "@/components/gallery/locked-tile";
import { MemberGate } from "@/components/member-gate";

interface Props {
  params: Promise<{ id: string }>;
}

// 会員解錠状態（Cookie）をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const photos = await prisma.photo.findMany({
    where: { isPublished: true, beforeUrl: { not: null } },
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
  return {
    title: `Before & After — ${photo.title}`,
    description: `${photo.title} のレタッチ前後を比較。RAW現像の過程をご覧いただけます。`,
    ...(photo.collection?.isLocked
      ? { robots: { index: false, follow: false } }
      : {}),
    ...pageSeo({
      path: `/gallery/${id}/compare`,
      // 会員限定コレクションは OG に本画像を出さない
      image: photo.collection?.isLocked ? undefined : photo.imageUrl,
      type: "article",
    }),
  };
}

export default async function ComparePage({ params }: Props) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { collection: true },
  });
  if (!photo || !photo.isPublished) notFound();
  if (!photo.beforeUrl) redirect(`/gallery/${id}`);

  const gated = photo.collection?.isLocked ?? false;
  const unlocked =
    !gated ||
    (photo.collectionId
      ? await isCollectionUnlocked(photo.collectionId)
      : false);
  const masked = gated && !unlocked;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/gallery/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Photo
      </Link>

      <p className="eyebrow">
        <span className="text-safelight">RAW</span> / Development
      </p>
      <h1 className="mb-2 mt-2 font-heading text-4xl font-medium">
        Before &amp; After
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {photo.title} — Drag the slider to compare RAW and edited versions.
      </p>

      {masked ? (
        <LockedTile
          blurDataUrl={photo.blurDataUrl}
          width={photo.imageWidth}
          height={photo.imageHeight}
          className="viewfinder mx-auto max-h-[70vh] w-full"
          label="会員限定 — 解錠でビフォーアフターを表示"
        />
      ) : (
        <CompareSlider beforeUrl={photo.beforeUrl} afterUrl={photo.imageUrl} />
      )}

      <Separator className="my-8" />

      <div className="max-w-md">
        <h2 className="eyebrow mb-4">Shooting Data</h2>
        {gated && !unlocked ? (
          <MemberGate message="会員限定です。note メンバーシップに参加すると、EXIF とビフォーアフターをご覧いただけます。" />
        ) : (
          <ExifTable photo={photo} />
        )}
      </div>
    </div>
  );
}
