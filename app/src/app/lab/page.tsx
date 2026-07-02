import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { LabExperience } from "./lab-experience";

// LAB — 実験場。DESIGN.md の運用規律の適用外（サンドボックス）。検索には載せない。
export const metadata: Metadata = {
  title: "LAB — KSK Works",
  description: "実験室。動くエディトリアル。",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function LabPage() {
  // RSC ペイロードはクライアントへ直列化されるため、必要最小限のフィールドだけ select する
  // （originalUrl・EXIF・現像ノート等の非公開系を漏らさない）
  const photos = await prisma.photo.findMany({
    where: { isPublished: true, ...excludeLockedPhotos },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, title: true, imageUrl: true, thumbnailUrl: true },
  });
  return <LabExperience photos={photos} />;
}
