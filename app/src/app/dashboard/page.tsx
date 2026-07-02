import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { ExifDashboard } from "@/components/dashboard/exif-charts";
import { PageTitle } from "@/components/ui/page-title";

// 件数集計用の小さなヘルパー（サーバー側でのみ実行）
function countBy<T>(items: T[], key: (i: T) => string | null) {
  const counts: Record<string, number> = {};
  for (const it of items) {
    const k = key(it);
    if (k) counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const ISO_BUCKETS = [
  { label: "100", min: 0, max: 100 },
  { label: "200-400", min: 101, max: 400 },
  { label: "800-1600", min: 401, max: 1600 },
  { label: "3200+", min: 1601, max: Infinity },
];

export const metadata: Metadata = {
  ...pageSeo({ path: "/dashboard" }),
  title: "撮影データ",
  description:
    "これまでの撮影をデータで可視化 — レンズ使用率、焦点距離、ISO感度、カテゴリー比率。写真の EXIF から自動集計しています。",
};

export const revalidate = 3600;

export default async function DashboardPage() {
  // 会員限定（非公開）写真も含めて集計する。EXIF は本来 gated なので、
  // 集計はすべてサーバー側で行い、クライアントへは集計結果のみ渡す
  // （会員写真の個別 EXIF はペイロードに出さない＝復元不可）。
  // 散布図だけは「1枚ごと」の性質上、公開写真のみ（タイトル付き）に限定。
  const [all, scatterRows, uniqueLocations] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true },
      select: {
        lensModel: true,
        category: true,
        iso: true,
      },
    }),
    prisma.photo.findMany({
      where: {
        isPublished: true,
        ...excludeLockedPhotos,
        focalLength: { not: null },
        aperture: { not: null },
      },
      select: { focalLength: true, aperture: true, title: true },
    }),
    prisma.photo
      .findMany({
        where: { isPublished: true, location: { not: null } },
        distinct: ["location"],
        select: { location: true },
      })
      .then((r) => r.length),
  ]);

  const lensDist = countBy(all, (p) => p.lensModel);
  const categoryDist = countBy(all, (p) => p.category);
  const isoDist = ISO_BUCKETS.map((b) => ({
    name: b.label,
    count: all.filter((p) => p.iso != null && p.iso >= b.min && p.iso <= b.max)
      .length,
  }));
  const scatter = scatterRows.map((p) => ({
    focalLength: p.focalLength as number,
    aperture: p.aperture as number,
    title: p.title,
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <PageTitle en="Shooting Data" title="撮影データ" />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          これまでの撮影を、写真に記録された EXIF
          から自動集計してグラフにしています。どんな機材で、どんな設定で撮ってきたか
          ——
          実績の蓄積を数字でご覧いただけます。
        </p>
      </div>
      <ExifDashboard
        totalCount={all.length}
        uniqueLenses={lensDist.length}
        uniqueLocations={uniqueLocations}
        lensDist={lensDist}
        categoryDist={categoryDist}
        isoDist={isoDist}
        scatter={scatter}
      />
    </div>
  );
}
