import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isMember } from "@/lib/unlock-server";
import { PageTitle } from "@/components/ui/page-title";

export const metadata: Metadata = {
  ...pageSeo({ path: "/collections" }),
  title: "コレクション",
  description:
    "シリーズ単位のフォトコレクション — 撮影テーマごとにまとめた作品集。",
};

// 解錠状態(Cookie)をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  // 会員限定コレクションも除外せず表示し、非会員ならカバーをモザイクにする
  const [collections, member] = await Promise.all([
    prisma.collection.findMany({
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
    }),
    isMember(),
  ]);

  const withPhotos = collections.filter((c) => c._count.photos > 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <PageTitle en="Series" title="コレクション" />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          撮影テーマごとにまとめた作品集。
        </p>
      </div>

      {withPhotos.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
コレクションはまだありません。
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {withPhotos.map((collection) => {
            const cover = collection.photos[0];
            // 非会員には会員限定コレクションのカバーをモザイク（本画像を出さない）
            const masked = collection.isLocked && !member;
            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group viewfinder relative block overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-muted">
                  {cover &&
                    (masked ? (
                      // 本画像ではなく blur プレースホルダ(data URI)のみ
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover.blurDataUrl ?? undefined}
                        alt=""
                        aria-hidden
                        className="size-full scale-110 object-cover blur-xl brightness-90"
                      />
                    ) : (
                      <Image
                        src={cover.thumbnailUrl ?? cover.imageUrl}
                        alt={collection.title}
                        fill
                        placeholder={cover.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={cover.blurDataUrl ?? undefined}
                        className="ken-burns object-cover transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {masked && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                      <Lock className="size-3" />
                      会員限定
                    </span>
                  )}
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
                      枚
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
