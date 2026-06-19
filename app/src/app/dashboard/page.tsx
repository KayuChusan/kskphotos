import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { ExifDashboard } from "@/components/dashboard/exif-charts";

export const metadata: Metadata = {
  ...pageSeo({ path: "/dashboard" }),
  title: "撮影データ",
  description:
    "これまでの撮影をデータで可視化 — レンズ使用率、焦点距離、ISO感度、カテゴリー比率。写真の EXIF から自動集計しています。",
};

export const revalidate = 3600;

export default async function DashboardPage() {
  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="eyebrow">Shooting Data</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">
          撮影データ
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          これまでの撮影を、写真に記録された EXIF
          から自動集計してグラフにしています。どんな機材で、どんな設定で撮ってきたか
          ——
          実績の蓄積を数字でご覧いただけます。
        </p>
      </div>
      <ExifDashboard photos={photos} />
    </div>
  );
}
