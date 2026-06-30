import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { HeroSection } from "@/components/home/hero-section";
import { SnapScroll } from "@/components/home/snap-scroll";
import { CountUp } from "@/components/count-up";
import { SectionMark } from "@/components/ui/section-mark";
import { HOME_STATS_ENABLED } from "@/lib/feature-flags";

export const metadata: Metadata = pageSeo({ path: "/" });

// 「つくる」セクションの Web 対応範囲（幅広さの訴求）
const WEB_SCOPE = [
  { title: "新規制作", desc: "構成・デザインから実装・公開まで一括で。" },
  { title: "運用・保守", desc: "公開後の更新代行・改善・トラブル対応。当社制作なら移行後3ヶ月無償（月2回まで）。" },
  { title: "引き継ぎ", desc: "他社で作ったサイトの移管・保守も歓迎。" },
  { title: "リニューアル", desc: "既存サイトの作り替え・再設計。" },
] as const;

// ISR: 一定間隔で再生成し CDN/キャッシュから即返す（TTFB/LCP 改善）。
// ヒーローは「毎回ランダム」ではなく「再生成のたびに切り替わる」。
export const revalidate = 3600;

export default async function HomePage() {
  const heroWhere = {
    isPublished: true,
    isHero: true,
    ...excludeLockedPhotos,
  };

  const [featured, heroCount] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true, isPortfolio: true, ...excludeLockedPhotos },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // ヒーロー候補（管理画面で Hero 指定した写真）の件数。全件は読み込まない
    prisma.photo.count({ where: heroWhere }),
  ]);

  // 05「By the Numbers」の集計は HOME_STATS_ENABLED のときだけ実行（非表示時は DB コスト 0）
  const [totalPhotos, lenses, locations] = HOME_STATS_ENABLED
    ? await Promise.all([
        // 撮影データの集計は会員限定（非公開）も含めてカウント（件数のみ表示・値は出さない）
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
      ])
    : [
        0,
        [] as { lensModel: string | null }[],
        [] as { location: string | null }[],
      ];

  // ヒーロー候補から1枚だけ取得（count→skipで全件ロードを避ける）。指定が無ければ最新で代替。
  // ISR の再生成時に乱数が1回評価され、その期間のヒーローが決まる（純度ルール対象外）。
  // eslint-disable-next-line react-hooks/purity
  const heroSkip = heroCount > 0 ? Math.floor(Math.random() * heroCount) : 0;
  const heroPhoto =
    heroCount > 0
      ? await prisma.photo.findFirst({ where: heroWhere, skip: heroSkip })
      : (featured[0] ?? null);
  const mockupPhoto = heroPhoto ?? featured[0];

  return (
    <>
      <SnapScroll />
      <HeroSection photos={heroPhoto ? [heroPhoto] : featured} />

      {/* Introduction — 3本柱の宣言（生成り） */}
      <section data-snap>
        <div className="container mx-auto px-4 py-24">
          <SectionMark no="01" label="Introduction" className="mb-12" />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <h2 className="develop-text tagline-jp text-4xl font-semibold leading-snug md:text-5xl md:leading-snug">
              撮る、つくる、
              <br />
              ささえる。
            </h2>
            <div>
              <p className="text-sm leading-loose text-foreground-soft md:text-base md:leading-loose">
                KSK Works は、出張撮影を軸に、Web サイト制作・運用代行、
                IT サポートまでを一人で担う「フォトグラファー ×
                インフラエンジニア」の事務所です。
                政治の現場から七五三・家族写真まで、その人らしさが伝わる一枚を。
                そして、撮った写真が活きる場所づくりまで、まとめてお任せください。
              </p>
              <dl className="mt-10 space-y-3 border-t pt-6">
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="exif-text text-muted-foreground">Based in</dt>
                  <dd className="exif-text">KANAGAWA — 全国出張対応</dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="exif-text text-muted-foreground">Gear</dt>
                  <dd className="exif-text">RAW ・ ADOBE LIGHTROOM</dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="exif-text text-muted-foreground">For</dt>
                  <dd className="exif-text">個人・法人・政治団体 — お支払いは柔軟に対応</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Photography — フィルムストリップ（沈め面＋暖wash。写真＝暖色） */}
      <section data-snap className="safelight-wash bg-surface-sink py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <SectionMark no="02" label="Photography" />
              <h2 className="develop-text mt-3 tagline-jp text-4xl font-semibold md:text-5xl">
                撮る
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-soft">
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
                <div className="frame relative h-64 overflow-hidden md:h-80">
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

      {/* 03 Web Production — 濃紺チャプター前半（つくる）。04 と連続した「Web/IT の幕」 */}
      <section data-snap className="bluehour grain py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionMark no="03" label="Web Production" />
              <h2 className="develop-text mt-3 tagline-jp text-4xl font-semibold md:text-5xl">
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

            {/* 写真 → Web フロー（撮影×Web ワンストップを一目で） */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* 撮った写真（素材） */}
              {mockupPhoto && (
                <div className="frame relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-muted sm:w-28">
                  <Image
                    src={mockupPhoto.thumbnailUrl ?? mockupPhoto.imageUrl}
                    alt=""
                    fill
                    placeholder={mockupPhoto.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={mockupPhoto.blurDataUrl ?? undefined}
                    className="object-cover"
                    sizes="120px"
                  />
                  <span className="exif-text absolute bottom-1.5 left-1.5 text-safelight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    RAW
                  </span>
                </div>
              )}
              {/* 撮影 → 制作（写真＝RAW琥珀 → Web＝青の動作） */}
              <div className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground">
                <span className="font-mono text-2xl leading-none text-coolant">
                  →
                </span>
                <span className="exif-text">制作</span>
              </div>
              {/* 仕上がりのサイト（この サイト自体が制作例） */}
              <div className="min-w-0 flex-1 border bg-card">
                <div className="flex items-center gap-1.5 border-b px-3 py-2">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="exif-text ml-2 truncate text-muted-foreground">
                    kskworks.jp
                  </span>
                </div>
                {mockupPhoto && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={mockupPhoto.thumbnailUrl ?? mockupPhoto.imageUrl}
                      alt=""
                      fill
                      className="object-cover object-[50%_30%]"
                      sizes="(max-width: 1024px) 70vw, 35vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute inset-x-3 bottom-2.5">
                      <div className="h-2 w-1/2 rounded-full bg-white/85" />
                      <div className="mt-1 h-1.5 w-1/3 rounded-full bg-white/55" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 対応範囲カード（比率に依存せずどの幅でも読みやすい） */}
          <div className="mt-16">
            <p className="eyebrow mb-6">対応範囲</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WEB_SCOPE.map((s) => (
                <div
                  key={s.title}
                  className="rounded-lg bg-card-warm p-5 shadow-sm ring-1 ring-foreground/5"
                >
                  <h3 className="font-heading text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 IT Support — 濃紺チャプター後半（ささえる）。03 から連続する Web/IT の幕 */}
      <section data-snap className="bluehour grain py-24">
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
                  <span className="text-coolant">$</span> whoami
                </p>
                <p className="text-foreground">
                  infrastructure engineer / photographer
                </p>
                <p className="pt-2">
                  <span className="text-coolant">$</span> systemctl status
                  website
                </p>
                <p className="text-foreground">
                  <span className="text-coolant">●</span> active (running) —
                  サイトは止めない
                </p>
                <p className="pt-2">
                  <span className="text-coolant">$</span> support --request
                  &quot;なんでも&quot;
                </p>
                <p className="text-foreground">
                  → 機材選定からトラブルまで、まずはご相談を
                  <span className="ml-1 inline-block w-2 animate-pulse bg-coolant">
                    &nbsp;
                  </span>
                </p>
              </div>
            </div>

            <div>
              <SectionMark no="04" label="IT Support" />
              <h2 className="develop-text mt-3 tagline-jp text-4xl font-semibold md:text-5xl">
                ささえる
              </h2>
              <p className="mt-6 text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
                公開後のウェブサイトの運用・保守を継続サポート。更新代行、表示速度やスマホ対応の改善、
                ドメインやメールの設定、日々の「なんだか動かない」まで。
                本番に強い現役インフラエンジニアが、サイトと現場の困りごとを引き受けます。
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

      {/* Stats — 数字が育つまで非表示（HOME_STATS_ENABLED）。濃紺の締めを分断しないため 04→フッターを地続きに */}
      {HOME_STATS_ENABLED && (
      <section data-snap className="py-20">
        <div className="container mx-auto px-4">
          <SectionMark no="05" label="By the Numbers" className="mb-12" />
          <div className="grid gap-12 text-center sm:grid-cols-3">
            <div>
              <p className="develop font-heading text-7xl font-medium">
                {totalPhotos ? <CountUp value={totalPhotos} /> : "—"}
              </p>
              <p className="eyebrow-jp mt-3">掲載写真</p>
            </div>
            <div>
              <p className="develop font-heading text-7xl font-medium">
                {lenses.length ? <CountUp value={lenses.length} /> : "—"}
              </p>
              <p className="eyebrow-jp mt-3">使用レンズ</p>
            </div>
            <div>
              <p className="develop font-heading text-7xl font-medium">
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
      )}
    </>
  );
}
