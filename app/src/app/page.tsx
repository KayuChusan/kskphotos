import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { HomeExperience } from "@/components/home/home-experience";

export const metadata: Metadata = pageSeo({ path: "/" });

// ISR: 一定間隔で再生成（ヒーロー写真は再生成のたびに切り替わる）
export const revalidate = 3600;

export default async function HomePage() {
  const heroWhere = {
    isPublished: true,
    isHero: true,
    ...excludeLockedPhotos,
  };
  // RSC ペイロードはクライアントへ直列化されるため最小フィールドのみ select
  const select = {
    id: true,
    title: true,
    imageUrl: true,
    thumbnailUrl: true,
  } as const;

  const [featured, heroCount] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true, isPortfolio: true, ...excludeLockedPhotos },
      orderBy: { createdAt: "desc" },
      take: 8,
      select,
    }),
    prisma.photo.count({ where: heroWhere }),
  ]);

  // ヒーロー候補から1枚（count→skip で全件ロード回避）。ISR 再生成時に1回評価。
  // eslint-disable-next-line react-hooks/purity
  const heroSkip = heroCount > 0 ? Math.floor(Math.random() * heroCount) : 0;
  const heroPhoto =
    heroCount > 0
      ? await prisma.photo.findFirst({ where: heroWhere, skip: heroSkip, select })
      : (featured[0] ?? null);

  const photos = [
    ...(heroPhoto ? [heroPhoto] : []),
    ...featured.filter((p) => p.id !== heroPhoto?.id),
  ].slice(0, 6);

  return <HomeExperience photos={photos} />;
}
