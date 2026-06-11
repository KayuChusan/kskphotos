import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "シリーズ単位のフォトコレクション — 撮影テーマごとにまとめた作品集。",
};

export const revalidate = 3600;

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      photos: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { photos: { where: { isPublished: true } } } },
    },
  });

  const withPhotos = collections.filter((c) => c._count.photos > 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="eyebrow">Series</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">Collections</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          撮影テーマごとにまとめた作品集。
        </p>
      </div>

      {withPhotos.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No collections yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {withPhotos.map((collection) => {
            const cover = collection.photos[0];
            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group viewfinder relative block overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-muted">
                  {cover && (
                    <Image
                      src={cover.thumbnailUrl ?? cover.imageUrl}
                      alt={collection.title}
                      fill
                      placeholder={cover.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={cover.blurDataUrl ?? undefined}
                      className="ken-burns object-cover transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h2 className="font-heading text-3xl font-medium text-white">
                    {collection.title}
                  </h2>
                  <div className="mt-1.5 flex items-baseline gap-3">
                    <span className="exif-text text-white/60">
                      <span className="text-safelight">
                        {collection._count.photos}
                      </span>{" "}
                      photos
                    </span>
                    {collection.description && (
                      <span className="truncate text-xs text-white/60">
                        {collection.description}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
