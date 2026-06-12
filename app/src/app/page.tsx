import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/hero-section";
import { PhotoCard } from "@/components/gallery/photo-grid";
import { CountUp } from "@/components/count-up";

// 静的生成 + 管理画面の更新時にオンデマンド再検証（revalidatePhotoPages）
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, totalPhotos, lenses, locations] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true, isPortfolio: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.photo.count({ where: { isPublished: true } }),
    prisma.photo.findMany({
      where: { isPublished: true, lensModel: { not: null } },
      select: { lensModel: true },
      distinct: ["lensModel"],
    }),
    prisma.photo.findMany({
      where: { isPublished: true, location: { not: null } },
      select: { location: true },
      distinct: ["location"],
    }),
  ]);

  return (
    <>
      <HeroSection photos={featured} />

      {/* Introduction */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-24">
          <p className="eyebrow mb-12">
            <span className="text-safelight">01</span> / Introduction
          </p>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <h2 className="font-heading text-4xl font-medium leading-snug md:text-5xl md:leading-snug">
              人物と、
              <br />
              現場の空気を撮る。
            </h2>
            <div>
              <p className="text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
                KSK Works は、出張撮影を専門とするフォトグラファーです。
                議員・候補者のプロフィールやポスター撮影、街頭演説の記録といった政治の現場から、
                七五三・お宮参り・家族写真まで。
                その人らしさが伝わる瞬間を逃さず、一枚ずつ丁寧に仕上げてお届けします。
              </p>
              <dl className="mt-10 space-y-3 border-t pt-6">
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="exif-text text-muted-foreground">Based in</dt>
                  <dd className="exif-text">KANAGAWA / TOKYO — 出張撮影対応</dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="exif-text text-muted-foreground">Gear</dt>
                  <dd className="exif-text">SONY α7R IV ・ ADOBE LIGHTROOM</dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="exif-text text-muted-foreground">For</dt>
                  <dd className="exif-text">個人・法人・政治団体 — 請求書対応</dd>
                </div>
              </dl>
              <div className="mt-10 flex gap-8">
                <Link
                  href="/works"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  撮影実績 →
                </Link>
                <Link
                  href="/services"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  料金・メニュー →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-14 flex items-end justify-between border-b pb-5">
          <div>
            <p className="eyebrow">
              <span className="text-safelight">02</span> / Selected Works
            </p>
            <h2 className="mt-3 font-heading text-4xl font-medium md:text-5xl">
              Featured Work
            </h2>
          </div>
          <Link
            href="/gallery"
            className="exif-text hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            View All →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {featured.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/2] animate-pulse bg-muted" />
            ))}
          </div>
        )}

        <div className="mt-14 text-center sm:hidden">
          <Link
            href="/gallery"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-foreground/30 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background"
            )}
          >
            View All Photos
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <p className="eyebrow mb-12">
            <span className="text-safelight">03</span> / By the Numbers
          </p>
          <div className="grid gap-12 text-center sm:grid-cols-3">
            <div>
              <p className="font-heading text-7xl font-medium">
                {totalPhotos ? <CountUp value={totalPhotos} /> : "—"}
              </p>
              <p className="eyebrow mt-3">Photos in Gallery</p>
            </div>
            <div>
              <p className="font-heading text-7xl font-medium">
                {lenses.length ? <CountUp value={lenses.length} /> : "—"}
              </p>
              <p className="eyebrow mt-3">Lenses Used</p>
            </div>
            <div>
              <p className="font-heading text-7xl font-medium">
                {locations.length ? <CountUp value={locations.length} /> : "—"}
              </p>
              <p className="eyebrow mt-3">Locations Captured</p>
            </div>
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/dashboard"
              className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              Explore EXIF Dashboard →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
