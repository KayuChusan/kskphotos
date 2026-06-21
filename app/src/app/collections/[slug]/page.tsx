import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, LockOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isCollectionUnlocked } from "@/lib/unlock-server";
import { maskPhotoImage } from "@/lib/photo-visibility";
import { pageSeo } from "@/lib/seo";
import { PhotoCard } from "@/components/gallery/photo-grid";

interface Props {
  params: Promise<{ slug: string }>;
}

// 会員解錠状態（Cookie）をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const collections = await prisma.collection.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      photos: {
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { dateTaken: "desc" }],
        take: 1,
        select: { imageUrl: true },
      },
    },
  });
  if (!collection) return { title: "Not Found" };
  // 会員限定コレクションは noindex、OG にロック写真を使わない
  if (collection.isLocked) {
    return {
      title: collection.title,
      description:
        collection.description ?? `${collection.title} — 会員限定コレクション`,
      robots: { index: false, follow: false },
      ...pageSeo({ path: `/collections/${slug}`, type: "article" }),
    };
  }
  return {
    title: collection.title,
    description: collection.description ?? `${collection.title} — フォトコレクション`,
    ...pageSeo({
      path: `/collections/${slug}`,
      image: collection.photos[0]?.imageUrl,
      type: "article",
    }),
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      photos: {
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { dateTaken: "desc" }],
      },
    },
  });
  if (!collection || !collection.isPublished) notFound();

  const gated = collection.isLocked;
  const unlocked = !gated || (await isCollectionUnlocked(collection.id));
  // 未解錠の会員限定コレクションは、全写真をモザイク（本画像・EXIF を伏せる）
  const visiblePhotos =
    gated && !unlocked
      ? collection.photos.map((p) => maskPhotoImage(p))
      : collection.photos;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/collections"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All Collections
      </Link>

      <div className="mb-12">
        <p className="eyebrow">
          Series /{" "}
          <span className="text-safelight">{collection.photos.length}</span>{" "}
          photos
        </p>
        <h1 className="mt-2 font-heading text-5xl font-medium">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
        )}

        {gated && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
            {unlocked ? (
              <>
                <LockOpen className="size-3.5 text-safelight" />
                解錠済み — EXIF・現像レシピを表示しています
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                会員限定 — note メンバーシップの解錠リンクで EXIF・現像レシピが見られます
              </>
            )}
          </div>
        )}
      </div>

      {collection.photos.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No photos in this collection yet.
        </p>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 md:columns-3 xl:columns-4">
          {visiblePhotos.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={i}
              masked={gated && !unlocked}
            />
          ))}
        </div>
      )}
    </div>
  );
}
