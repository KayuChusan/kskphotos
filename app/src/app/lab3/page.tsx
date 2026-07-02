import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { Lab3Covers } from "./lab3-covers";

// LAB3 — ヒーロー（表紙）特化の追求。/lab の「写」グリフに対する代替案を
// 全画面3案で並べ、PC の空白・改行設計（句読点折り）を是正する。noindex。
export const metadata: Metadata = {
  title: "LAB 03 — KSK Works",
  description: "表紙の追求。3つの代替案。",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function Lab3Page() {
  const photos = await prisma.photo.findMany({
    where: { isPublished: true, ...excludeLockedPhotos },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, title: true, imageUrl: true, thumbnailUrl: true },
  });
  return <Lab3Covers photos={photos} />;
}
