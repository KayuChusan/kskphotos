import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { excludeLockedPhotos } from "@/lib/photo-visibility";
import { HeroSection } from "@/components/home/hero-section";
import { SnapScroll } from "@/components/home/snap-scroll";
import { SectionMark } from "@/components/ui/section-mark";
import { buttonVariants } from "@/components/ui/button";
import { BrushStroke } from "@/components/home/brush-stroke";
import { cn } from "@/lib/utils";
import {
  Camera,
  LayoutGrid,
  PenTool,
  Monitor,
  Server,
  Gauge,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = pageSeo({ path: "/" });

// ワークフロー — 撮影から運用までを一本の流れとして見せる（トップの背骨）
const WORKFLOW = [
  {
    no: "01",
    label: "CAPTURE",
    title: "現場の空気を撮る。",
    desc: "人物・現場・イベント。その瞬間の温度ごと、高品質な写真で切り取ります。",
  },
  {
    no: "02",
    label: "CONVERT",
    title: "写真を、伝わるWebに変える。",
    desc: "撮った素材が最も活きる設計と実装で、見た人の心を動かし、成果につなげるサイトをつくります。",
  },
  {
    no: "03",
    label: "KEEP RUNNING",
    title: "サイトを、止めない。",
    desc: "表示速度・セキュリティ・保守まで。インフラエンジニアの視点で、公開後も止めない運用を支えます。",
  },
] as const;

// 「つくる」セクションの Web 対応範囲（幅広さの訴求）
const WEB_SCOPE = [
  { title: "新規制作", desc: "構成・デザインから実装・公開まで一括で。" },
  { title: "運用・保守", desc: "公開後の更新代行・改善・トラブル対応。当社制作なら移行後3ヶ月無償（月2回まで）。" },
  { title: "引き継ぎ", desc: "他社で作ったサイトの移管・保守も歓迎。" },
  { title: "リニューアル", desc: "既存サイトの作り替え・再設計。" },
] as const;

// 料金の入口（ソースは services-data.ts / docs/14。変更時は同期する）
const PRICE_CARDS = [
  {
    icon: Camera,
    label: "撮影（時間制）",
    price: "¥14,000",
    unit: "〜 / 1時間",
    note: "半日4時間 ¥44,000・1日8時間 ¥78,000。1時間あたり約20枚をセレクト納品。",
  },
  {
    icon: Monitor,
    label: "Web 制作",
    price: "¥128,000",
    unit: "〜",
    note: "構成・デザイン・実装・公開まで一括。多機能・作り込みは ¥248,000〜目安。",
  },
  {
    icon: Server,
    label: "保守・運用",
    price: "¥11,000",
    unit: "〜 / 月額",
    note: "更新代行・ドメイン/SSL 管理・障害一次対応。当社制作は移行後3ヶ月無償。",
  },
] as const;

// ISR: 一定間隔で再生成し CDN/キャッシュから即返す（TTFB/LCP 改善）。
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
    prisma.photo.count({ where: heroWhere }),
  ]);

  // ヒーロー候補から1枚だけ取得（count→skipで全件ロードを避ける）。指定が無ければ最新で代替。
  // ISR の再生成時に乱数が1回評価され、その期間のヒーローが決まる（純度ルール対象外）。
  // eslint-disable-next-line react-hooks/purity
  const heroSkip = heroCount > 0 ? Math.floor(Math.random() * heroCount) : 0;
  const heroPhoto =
    heroCount > 0
      ? await prisma.photo.findFirst({ where: heroWhere, skip: heroSkip })
      : (featured[0] ?? null);
  // コラージュ用に主写真＋別カット（重複は除く）
  const collagePhotos = [
    ...(heroPhoto ? [heroPhoto] : []),
    ...featured.filter((p) => p.id !== heroPhoto?.id),
  ].slice(0, 3);
  const mockupPhoto = collagePhotos[1] ?? collagePhotos[0];

  return (
    <>
      <SnapScroll />
      <HeroSection photos={collagePhotos} />

      {/* 01 Concept — 撮影で終わらない、という宣言 */}
      <section data-snap>
        <div className="container mx-auto px-4 py-24">
          <SectionMark no="01" label="Concept" className="mb-12" />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <h2 className="reveal-sweep statement-jp text-3xl leading-normal md:text-4xl md:leading-normal">
              撮影で終わらない。
              <br />
              納品で終わらない。
              <br />
              公開してからも、終わらない。
            </h2>
            <div>
              <p className="text-sm leading-loose text-foreground-soft md:text-base md:leading-loose">
                KSK Works は、出張撮影・Web サイト制作・IT
                サポートを一人で担う「フォトグラファー ×
                インフラエンジニア」の事務所です。
                写真を撮って終わり、ではなく——その写真が働く場所（Web）をつくり、
                公開後の運用まで守る。だから、写したあとが、強い。
              </p>
              <p className="eyebrow mt-8">Principle</p>
              <p className="statement-jp mt-2 text-xl md:text-2xl">
                撮る、つくる、ささえる。
              </p>
              <dl className="mt-8 space-y-3 border-t pt-6">
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
                  <dd className="exif-text">
                    個人・法人・政治団体 — お支払いは柔軟に対応
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Workflow — 私たちの仕事は、ひとつの流れ */}
      <section data-snap className="bg-surface-sink py-24">
        <div className="container mx-auto px-4">
          <SectionMark no="02" label="Workflow" className="mb-4" />
          <p className="text-sm text-foreground-soft">
            私たちの仕事は、ひとつの流れ。
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {WORKFLOW.map((step) => (
              <div key={step.no} className="relative">
                {/* 赤の裁ちマーク — 現場・紙面の痕跡 */}
                <span className="relative inline-block px-3 py-1.5">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 size-3 border-l-2 border-t-2"
                    style={{ borderColor: "var(--rec)" }}
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 size-3 border-b-2 border-r-2"
                    style={{ borderColor: "var(--rec)" }}
                  />
                  <span className="font-mono text-3xl font-medium tabular-nums text-foreground md:text-4xl">
                    {step.no}
                  </span>
                </span>
                <p className="eyebrow mt-3">{step.label}</p>
                <h3 className="statement-jp mt-2 text-xl md:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground md:text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          {/* パイプライン — アイコンの流れ（ヒーローの署名の再掲・締め） */}
          <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-4 border-t pt-8 md:gap-x-6">
            {[
              { icon: Camera, label: "RAW" },
              { icon: LayoutGrid, label: "SELECT" },
              { icon: PenTool, label: "DESIGN" },
              { icon: Monitor, label: "WEB" },
              { icon: Server, label: "KEEP RUNNING" },
            ].map(({ icon: Icon, label }, i) => (
              <span key={label} className="flex items-center gap-x-4 md:gap-x-6">
                {i > 0 && (
                  <span aria-hidden className="font-mono text-coolant">
                    →
                  </span>
                )}
                <span className="flex flex-col items-center gap-1.5">
                  <Icon className="size-5 text-foreground-soft" strokeWidth={1.5} />
                  <span className="exif-text text-muted-foreground">{label}</span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Photography — フィルムストリップ（写真＝暖・REC） */}
      <section data-snap className="safelight-wash py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <SectionMark no="03" label="Photography" />
              <h2 className="reveal-sweep statement-jp mt-3 text-3xl md:text-5xl">
                現場の空気を撮る。
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-soft">
                議員・候補者のポートレートから七五三・家族写真まで。
                現場の温度ごと、その人らしさを記録します。
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
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <Link
              href="/gallery"
              className="exif-text text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              空気まで、残す — ギャラリー →
            </Link>
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

      {/* 04 Web Production — 生成りのまま、青は「モノ」（設計図・罫・リンク）が持つ */}
      <section data-snap className="coolant-wash py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionMark no="04" label="Web Production" />
              <h2 className="reveal-sweep statement-jp mt-3 text-3xl md:text-5xl">
                写真を、
                <br className="md:hidden" />
                伝わるWebに変える。
              </h2>
              <p className="mt-6 text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
                テンプレートの流用ではなく、撮った写真が最も活きる構成・デザイン・実装で。
                新規制作から運用・保守、引き継ぎ、リニューアルまで対応します。
                ご覧いただいているこのサイト自体が、つくれるものの見本です。
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
                  <span className="exif-text absolute bottom-1.5 left-1.5 text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    RAW
                  </span>
                </div>
              )}
              <div className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground">
                <span className="font-mono text-2xl leading-none text-coolant">
                  →
                </span>
                <span className="exif-text">制作</span>
              </div>
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

          {/* 対応範囲カード */}
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

      {/* 05 IT Support — 濃紺コンソールカード（運用＝機械の声。バンドではなくカードで携える） */}
      <section data-snap className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionMark no="05" label="IT Support" />
              <h2 className="reveal-sweep statement-jp mt-3 text-3xl md:text-5xl">
                サイトを、止めない。
              </h2>
              <p className="mt-6 text-sm leading-loose text-foreground-soft md:text-base md:leading-loose">
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

            {/* サポートコンソール — 濃紺の機械の窓（コマンド＋実務の中身） */}
            <div className="bluehour overflow-hidden rounded-xl shadow-lg">
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="exif-text ml-3 text-muted-foreground">
                  KSK SUPPORT CONSOLE
                </span>
              </div>
              <div className="space-y-3 p-6">
                {[
                  { cmd: "capture --moment", note: "現場の価値ある瞬間を、写真に。" },
                  { cmd: "build --website", note: "伝わる Web で、活動を加速。" },
                  { cmd: "keep --running", note: "インフラ視点で、止めない運用を。" },
                ].map(({ cmd, note }, i) => (
                  <div key={cmd}>
                    <p
                      className={`type-line type-line-${i + 1} font-mono text-xs text-muted-foreground md:text-sm`}
                    >
                      <span className="text-coolant">$</span> {cmd}
                    </p>
                    <p className="mt-0.5 pl-4 text-xs leading-relaxed text-foreground-soft">
                      {note}
                    </p>
                  </div>
                ))}
                <p className="type-line type-line-4 font-mono text-xs text-foreground md:text-sm">
                  <span className="text-[oklch(0.8_0.17_150)]">●</span> active
                  (running) — サイトは止めない
                  <span className="ml-1 inline-block w-2 animate-pulse bg-coolant">
                    &nbsp;
                  </span>
                </p>
                {/* 実務の中身 — 運用で実際にやること */}
                <ul className="mt-2 space-y-2 rounded-lg border bg-card p-4">
                  {[
                    { icon: Server, label: "サーバー・インフラの設計 / 運用" },
                    { icon: Gauge, label: "表示速度・セキュリティ最適化" },
                    { icon: ShieldCheck, label: "バックアップ / SSL・ドメイン管理" },
                    { icon: Wrench, label: "保守・トラブル対応" },
                  ].map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-3 text-xs text-foreground-soft"
                    >
                      <Icon
                        className="size-4 shrink-0 text-coolant"
                        strokeWidth={1.5}
                      />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 Price — 料金は隠さない */}
      <section data-snap className="bg-surface-sink py-24">
        <div className="container mx-auto px-4">
          <SectionMark no="06" label="Price" />
          <h2 className="reveal-sweep statement-jp mt-3 text-3xl md:text-4xl">
            料金は、分かりやすく。
            <br className="sm:hidden" />
            仕事は、ていねいに。
          </h2>
          <p className="mt-4 text-sm text-foreground-soft">
            時間制と規模別の明朗会計。内容に応じてお見積りします。
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PRICE_CARDS.map((card) => (
              <div
                key={card.label}
                className="flex flex-col rounded-lg border bg-card p-6 shadow-sm"
              >
                <card.icon
                  className="size-6 text-foreground-soft"
                  strokeWidth={1.5}
                />
                <p className="eyebrow-jp mt-4">{card.label}</p>
                <p className="mt-2 font-mono text-3xl font-medium tabular-nums">
                  {card.price}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {card.unit}
                  </span>
                </p>
                <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {card.note}
                </p>
                <Link
                  href="/services"
                  className="exif-text mt-5 text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                >
                  プラン詳細 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact — 濃紺の締め（フッターまで地続きの夜・筆致の縁） */}
      <section
        data-snap
        data-header-dark
        className="bluehour grain relative py-24"
      >
        {/* 上縁の筆致 — 生成りの紙面に濃紺をひと刷毛（帯の縁を機械的な直線にしない） */}
        <BrushStroke
          id="cta-edge"
          color="oklch(0.16 0.045 262)"
          className="brush-on pointer-events-none absolute inset-x-0 -top-8 z-10 h-12 w-full"
        />
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">
                <span className="rec-blink mr-2 inline-block text-rec">●</span>
                Contact
              </p>
              <h2 className="statement-jp mt-4 text-3xl md:text-4xl">
                まずは、お気軽に
                <br className="sm:hidden" />
                ご相談ください。
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                撮影・Web 制作・IT サポートのこと、なんでもどうぞ。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {/* 無料バッジ — 円の判子 */}
              <span className="flex size-24 shrink-0 flex-col items-center justify-center rounded-full border-2 border-foreground/70 text-center">
                <span className="text-[10px] leading-tight text-muted-foreground">
                  ご相談・お見積り
                </span>
                <span className="statement-jp mt-0.5 text-xl">無料</span>
              </span>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group font-mono text-xs tracking-[0.14em]"
                )}
              >
                相談する
                <span
                  aria-hidden
                  className="inline-block transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                href="/booking"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "group font-mono text-xs tracking-[0.14em]"
                )}
              >
                撮影を相談する
                <span
                  aria-hidden
                  className="inline-block transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
