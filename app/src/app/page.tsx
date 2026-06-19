import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/hero-section";
import { CountUp } from "@/components/count-up";

export const metadata: Metadata = pageSeo({ path: "/" });

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

  const mockupPhoto = featured[0];

  return (
    <>
      <HeroSection photos={featured} />

      {/* Introduction — 3本柱の宣言 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-24">
          <p className="eyebrow mb-12">
            <span className="text-safelight">01</span> / Introduction
          </p>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <h2 className="font-heading text-4xl font-medium leading-snug md:text-5xl md:leading-snug">
              撮る、つくる、
              <br />
              ささえる。
            </h2>
            <div>
              <p className="text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
                KSK Works は、出張撮影を軸に、Web サイト制作・運用代行、
                IT サポートまでを一人で担う「フォトグラファー ×
                インフラエンジニア」の事務所です。
                政治の現場から七五三・家族写真まで、その人らしさが伝わる一枚を。
                そして、撮った写真が活きる場所づくりまで、まとめてお任せください。
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
            </div>
          </div>
        </div>
      </section>

      {/* 02 Photography — フィルムストリップ */}
      <section className="border-b py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow">
                <span className="text-safelight">02</span> / Photography
              </p>
              <h2 className="mt-3 font-heading text-4xl font-medium md:text-5xl">
                撮る
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                議員・候補者のポートレートから家族写真まで。
                現場の空気ごと、その人らしさを記録します。
              </p>
            </div>
            <Link
              href="/gallery"
              className="exif-text hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              すべて見る →
            </Link>
          </div>
        </div>

        {/* 横スクロールの一列 — フィルムの帯 */}
        <div className="border-y">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((photo, i) => (
              <Link
                key={photo.id}
                href={`/gallery/${photo.id}`}
                className="group shrink-0 snap-start"
              >
                <div className="viewfinder relative h-64 overflow-hidden md:h-80">
                  <Image
                    src={photo.thumbnailUrl ?? photo.imageUrl}
                    alt={photo.title}
                    width={photo.imageWidth ?? 1200}
                    height={photo.imageHeight ?? 800}
                    placeholder={photo.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={photo.blurDataUrl ?? undefined}
                    className="h-full w-auto max-w-none transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-110"
                    sizes="(max-width: 768px) 80vw, 40vw"
                  />
                </div>
                <p className="exif-text mt-2 text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} — {photo.title}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="mt-8 flex gap-8">
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
      </section>

      {/* 03 Web Production */}
      <section className="border-b py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow">
                <span className="text-safelight">03</span> / Web Production
              </p>
              <h2 className="mt-3 font-heading text-4xl font-medium md:text-5xl">
                つくる
              </h2>
              <p className="mt-6 text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
                撮った写真が活きる Web サイトを、構成からデザイン・実装・公開まで一括で。
                新規制作はもちろん、公開後の運用・保守、既存サイトの引き継ぎやリニューアルにも対応します。
                撮影とまとめてご依頼いただくと、素材からサイトまで一貫＋セット価格でお得に。
                ご覧いただいているこのサイト自体が制作例です。
              </p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <Link
                  href="/guide"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  ご利用案内（撮影×Web）→
                </Link>
                <Link
                  href="/services"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  料金・メニュー →
                </Link>
                <Link
                  href="/contact"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  相談する →
                </Link>
              </div>
            </div>

            {/* ブラウザ風フレーム(後日スクリーンショットに差し替え可) */}
            <div className="border bg-card">
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="exif-text ml-3 text-muted-foreground">
                  kskworks.jp
                </span>
              </div>
              <div className="space-y-3 p-6">
                {mockupPhoto && (
                  <div className="h-32 overflow-hidden md:h-40">
                    <Image
                      src={mockupPhoto.thumbnailUrl ?? mockupPhoto.imageUrl}
                      alt=""
                      width={mockupPhoto.imageWidth ?? 1200}
                      height={mockupPhoto.imageHeight ?? 800}
                      className="h-full w-full object-cover object-top"
                      sizes="(max-width: 1024px) 90vw, 45vw"
                    />
                  </div>
                )}
                <div className="h-3 w-2/3 bg-muted" />
                <div className="h-3 w-1/2 bg-muted" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="h-14 bg-muted" />
                  <div className="h-14 bg-muted" />
                  <div className="h-14 bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 IT Support */}
      <section className="border-b py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* ターミナル風パネル(後日現場写真に差し替え可) */}
            <div className="order-last border bg-card lg:order-first">
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="exif-text ml-3 text-muted-foreground">
                  ksk@works: ~
                </span>
              </div>
              <div className="space-y-2 p-6 font-mono text-xs leading-relaxed text-muted-foreground md:text-sm">
                <p>
                  <span className="text-safelight">$</span> whoami
                </p>
                <p className="text-foreground">
                  infrastructure engineer / photographer
                </p>
                <p className="pt-2">
                  <span className="text-safelight">$</span> systemctl status
                  live-stream
                </p>
                <p className="text-foreground">
                  <span className="text-safelight">●</span> active (running) —
                  本番は止めない
                </p>
                <p className="pt-2">
                  <span className="text-safelight">$</span> support --request
                  &quot;なんでも&quot;
                </p>
                <p className="text-foreground">
                  → 機材選定からトラブルまで、まずはご相談を
                  <span className="ml-1 inline-block w-2 animate-pulse bg-safelight">
                    &nbsp;
                  </span>
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow">
                <span className="text-safelight">04</span> / IT Support
              </p>
              <h2 className="mt-3 font-heading text-4xl font-medium md:text-5xl">
                ささえる
              </h2>
              <p className="mt-6 text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
                街宣・集会のライブ配信環境づくり、事務所の IT まわりの整備、
                ドメインやメールの設定、日々の「なんだか動かない」まで。
                本番に強い現役インフラエンジニアが、現場の困りごとを引き受けます。
              </p>
              <div className="mt-8 flex gap-8">
                <Link
                  href="/services"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  料金・メニュー →
                </Link>
                <Link
                  href="/contact"
                  className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  相談する →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <p className="eyebrow mb-12">
            <span className="text-safelight">05</span> / By the Numbers
          </p>
          <div className="grid gap-12 text-center sm:grid-cols-3">
            <div>
              <p className="font-heading text-7xl font-medium">
                {totalPhotos ? <CountUp value={totalPhotos} /> : "—"}
              </p>
              <p className="eyebrow-jp mt-3">掲載写真</p>
            </div>
            <div>
              <p className="font-heading text-7xl font-medium">
                {lenses.length ? <CountUp value={lenses.length} /> : "—"}
              </p>
              <p className="eyebrow-jp mt-3">使用レンズ</p>
            </div>
            <div>
              <p className="font-heading text-7xl font-medium">
                {locations.length ? <CountUp value={locations.length} /> : "—"}
              </p>
              <p className="eyebrow-jp mt-3">撮影場所</p>
            </div>
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/dashboard"
              className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
撮影データを見る →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
