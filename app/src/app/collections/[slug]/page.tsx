import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pageSeo } from "@/lib/seo";
import { PhotoCard } from "@/components/gallery/photo-grid";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

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
      </div>

      {collection.photos.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No photos in this collection yet.
        </p>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 md:columns-3 xl:columns-4">
          {collection.photos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
