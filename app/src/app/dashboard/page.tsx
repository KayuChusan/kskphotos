import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ExifDashboard } from "@/components/dashboard/exif-charts";

export const metadata: Metadata = {
  title: "EXIF Dashboard",
  description:
    "撮影データの統計ダッシュボード — レンズ使用率、焦点距離分布、ISO感度、カテゴリ比率を可視化。",
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
          EXIF Dashboard
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Shooting statistics and gear usage analytics, automatically extracted
          from photo EXIF data.
        </p>
      </div>
      <ExifDashboard photos={photos} />
    </div>
  );
}
