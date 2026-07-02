import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { Lab2Experience } from "./lab2-experience";

// LAB2 — /lab（生きているポスター）を基準に、本編（DESIGN.md）の品質規律へ翻訳した版。
// トークン参照・AA・和文タイポ規則・タッチ44px・reduced-motion を満たしつつ、
// トップページの義務（3本柱・実価格・導線）を織り込む。まだ実験扱い＝noindex。
export const metadata: Metadata = {
  title: "LAB 02 — KSK Works",
  description: "生きているポスター、本編品質版。",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function Lab2Page() {
  // RSC ペイロード最小化（非公開フィールドを漏らさない）
  const photos = await prisma.photo.findMany({
    where: { isPublished: true, ...excludeLockedPhotos },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, title: true, imageUrl: true, thumbnailUrl: true },
  });
  return <Lab2Experience photos={photos} />;
}
