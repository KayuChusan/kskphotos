"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { BrushStroke } from "@/components/home/brush-stroke";
import { cn } from "@/lib/utils";
import type { Photo } from "@/generated/prisma/client";

interface HeroSectionProps {
  photos: Photo[];
}

// 上質でなめらかな減速（easeOutExpo 系）。
const EASE = [0.16, 1, 0.3, 1] as const;

/** 撮影→公開→運用のパイプライン表記（ヒーロー下端の署名モチーフ） */
const PIPELINE = ["RAW", "SELECT", "DESIGN", "WEB", "KEEP RUNNING"] as const;

/** トリムマーク（赤の裁ち落とし）— 印刷・現場の痕跡 */
function TrimMark({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute size-5", className)}
      style={{ borderColor: "var(--rec)" }}
    />
  );
}

export function HeroSection({ photos }: HeroSectionProps) {
  const reduce = useReducedMotion() ?? false;

  const main = photos[0];
  const second = photos[1] ?? photos[0];
  const third = photos[2];
  const filmPhotos = photos.slice(0, 3);

  // コピー側: LCP の h1 を止めないため opacity は常に 1、入場は y のみ
  const group: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: reduce ? 0 : 0.15,
      },
    },
  };
  const rise: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 1, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
      };
  // コラージュ側: 机の上に印刷物を1枚ずつ重ねて置くように着地する
  const collage: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.13,
        delayChildren: reduce ? 0 : 0.35,
      },
    },
  };
  // 不透明度は常に 1（アニメ不発・LCP 阻害でヒーローが不可視になる事故を構造的に防ぐ）。
  // 入場は変形（y / rotate / scale）のみ。
  const layer: Variants = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 1, y: 30 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: EASE },
        },
      };
  const chip: Variants = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 1, scale: 0.85, rotate: -12 },
        show: {
          opacity: 1,
          scale: 1,
          rotate: -6,
          transition: { duration: 0.6, ease: EASE },
        },
      };

  return (
    <section className="relative overflow-hidden">
      {/* 左端の縦ラベル — 三幕（撮る/つくる/ささえる）の欧文レール */}
      <div
        aria-hidden
        className="exif-text pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 text-muted-foreground/50 xl:block"
        style={{ writingMode: "vertical-rl" }}
      >
        CAPTURE / BUILD / KEEP RUNNING
      </div>

      {/* 右端のフィルムストリップ — 現像上がりの目送り（実写真） */}
      {filmPhotos.length > 0 && (
        <div
          aria-hidden
          className="absolute bottom-24 right-0 top-24 z-10 hidden w-14 bg-[oklch(0.13_0.01_75)] py-2 shadow-lg lg:flex lg:flex-col lg:gap-1.5"
        >
          {/* パーフォレーション（左右の送り穴） */}
          <span
            className="pointer-events-none absolute inset-y-0 left-1 w-[5px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0 5px, oklch(0.9 0.005 85 / 0.85) 5px 11px, transparent 11px 16px)",
            }}
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-1 w-[5px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0 5px, oklch(0.9 0.005 85 / 0.85) 5px 11px, transparent 11px 16px)",
            }}
          />
          {[...filmPhotos, ...filmPhotos].slice(0, 5).map((p, i) => (
            <span
              key={`${p.id}-${i}`}
              className="relative mx-2 block flex-1 overflow-hidden"
            >
              <Image
                src={p.thumbnailUrl ?? p.imageUrl}
                alt=""
                fill
                className="object-cover brightness-90 contrast-105"
                sizes="56px"
              />
            </span>
          ))}
        </div>
      )}

      <div className="container mx-auto flex min-h-[88svh] items-center px-4 pb-10 pt-28 md:pt-32 xl:px-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-6">
          {/* ステートメント（左） */}
          <motion.div
            className="lg:col-span-6"
            variants={group}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.p variants={rise} className="eyebrow">
              <span className="rec-blink mr-2 inline-block text-rec">●</span>
              REC — PHOTOGRAPHY / WEB / IT
            </motion.p>

            <motion.h1
              variants={rise}
              className="statement-jp mt-6 text-[clamp(2.75rem,10vw,4.25rem)] md:text-[clamp(3.5rem,7vw,6rem)]"
            >
              写したあとが、
              <br />
              強い。
            </motion.h1>

            {/* 行動原理 — 三幕の宣言（REC レッドの筆致下線） */}
            <motion.p
              variants={rise}
              className="statement-jp relative mt-7 inline-block text-xl md:text-2xl"
            >
              撮る、つくる、ささえる。
              <svg
                aria-hidden
                className="absolute -bottom-2 left-0 w-full"
                height="6"
                viewBox="0 0 200 6"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 4.5 C 40 2, 80 5, 120 3 S 180 4, 198 2.5"
                  fill="none"
                  stroke="var(--rec)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.p>

            <motion.p
              variants={rise}
              className="mt-6 max-w-xl text-sm leading-loose text-foreground-soft md:text-base md:leading-loose"
            >
              写真で惹きつけ、Web で受け止め、運用で止めない。
              <br />
              撮影・Web 制作・IT サポートを、ひとつの窓口で。
            </motion.p>

            <motion.div
              variants={rise}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/gallery"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group font-mono text-xs tracking-[0.14em]"
                )}
              >
                ギャラリーを見る
                <span
                  aria-hidden
                  className="inline-block transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
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
            </motion.div>
          </motion.div>

          {/* 机の上のコラージュ（右）— 撮影 → 設計 → Web 化 → 運用の実物が重なる */}
          <motion.div
            className="relative h-[28rem] sm:h-[32rem] lg:col-span-6 lg:mr-10 lg:h-[36rem]"
            variants={collage}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            {/* トリムマーク — 紙面の裁ち落とし */}
            <TrimMark className="-left-2 -top-2 border-l-2 border-t-2" />
            <TrimMark className="-bottom-2 -right-2 border-b-2 border-r-2" />

            {/* 主写真 — 現場（撮る） */}
            {main && (
              <motion.div
                variants={layer}
                className="frame absolute right-0 top-0 h-[62%] w-[78%] overflow-hidden bg-muted shadow-lg"
              >
                <Image
                  src={main.thumbnailUrl ?? main.imageUrl}
                  alt={main.title}
                  fill
                  placeholder={main.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={main.blurDataUrl ?? undefined}
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  priority
                  fetchPriority="high"
                />
                <span className="exif-text absolute bottom-2 right-2.5 text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  <span className="text-[oklch(0.72_0.2_29)]">●</span> RAW
                </span>
                {(main.aperture || main.iso) && (
                  <span className="exif-text absolute right-2.5 top-2 text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {[
                      main.aperture ? `f/${main.aperture}` : null,
                      main.iso ? `ISO ${main.iso}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </motion.div>
            )}

            {/* 銀塩プリント — セレクトされた1枚（余白付きの紙） */}
            {third && (
              <motion.div
                variants={layer}
                className="absolute left-0 top-[2%] z-10 w-[30%] -rotate-3 bg-white p-1.5 pb-6 shadow-lg"
              >
                <span className="relative block aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    src={third.thumbnailUrl ?? third.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 35vw, 16vw"
                  />
                </span>
                <span className="exif-text absolute bottom-1.5 left-2 text-[oklch(0.45_0.01_75)]">
                  SELECT — 01
                </span>
              </motion.div>
            )}

            {/* 設計図 — ワイヤーフレーム（青の筆致の上） */}
            <motion.div
              variants={layer}
              className="absolute bottom-[2%] left-0 z-10 w-[42%] -rotate-2"
            >
              <BrushStroke
                id="hero-wire"
                color="var(--brand-blue)"
                className="absolute -bottom-5 -left-6 -z-10 h-20 w-[120%] rotate-[-4deg]"
              />
              <div
                className="border bg-card p-3 shadow-lg"
                style={{
                  backgroundImage:
                    "linear-gradient(oklch(0.6 0.12 262 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.12 262 / 0.08) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
              >
                <span className="exif-text text-muted-foreground">
                  LAYOUT / 1280PX
                </span>
                <span className="mt-2 block border border-coolant/60 p-1.5">
                  <span className="block h-6 border border-dashed border-coolant/50" />
                  <span className="mt-1.5 flex gap-1.5">
                    <span className="block h-10 flex-1 border border-dashed border-coolant/50" />
                    <span className="block h-10 w-1/3 border border-dashed border-coolant/50" />
                  </span>
                </span>
              </div>
            </motion.div>

            {/* ブラウザモック — 写真が Web になる（つくる） */}
            <motion.div
              variants={layer}
              className="absolute bottom-[20%] left-[32%] z-20 w-[50%] border bg-card shadow-lg"
            >
              <div className="flex items-center gap-1.5 border-b px-3 py-2">
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="exif-text ml-2 truncate text-muted-foreground">
                  kskworks.jp
                </span>
              </div>
              {second && (
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <Image
                    src={second.thumbnailUrl ?? second.imageUrl}
                    alt=""
                    fill
                    placeholder={second.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={second.blurDataUrl ?? undefined}
                    className="object-cover object-[50%_30%]"
                    sizes="(max-width: 1024px) 55vw, 26vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute inset-x-3 bottom-2.5">
                    <div className="h-2 w-1/2 rounded-full bg-white/85" />
                    <div className="mt-1 h-1.5 w-1/3 rounded-full bg-white/55" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* ターミナル — 公開後も動き続ける（ささえる） */}
            <motion.div
              variants={layer}
              className="bluehour absolute bottom-0 right-0 z-30 w-[54%] overflow-hidden rounded-md shadow-xl sm:w-[44%]"
            >
              <div className="flex items-center gap-1.5 border-b px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                <span className="exif-text ml-1.5 text-muted-foreground">
                  ksk@works: ~
                </span>
              </div>
              <div className="space-y-1 px-3 py-2.5 font-mono text-[11px] leading-relaxed">
                <p className="text-muted-foreground">
                  <span className="text-coolant">$</span> capture --moment
                </p>
                <p className="text-muted-foreground">
                  <span className="text-coolant">$</span> build --website
                </p>
                <p className="text-muted-foreground">
                  <span className="text-coolant">$</span> keep --running
                </p>
                <p className="text-foreground">
                  <span className="text-[oklch(0.8_0.17_150)]">●</span> active
                  (running)
                  <span className="ml-1 inline-block w-1.5 animate-pulse bg-coolant">
                    &nbsp;
                  </span>
                </p>
              </div>
            </motion.div>

            {/* フィルムイエローのテープ片 — 記憶の差し色 */}
            <motion.span
              variants={chip}
              className="tape absolute right-[30%] top-[-2%] z-40 -rotate-6 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
            >
              KSK WORKS — 2026
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* パイプライン — 撮影から運用までが一本の流れである、という署名 */}
      <div className="border-t">
        <div className="container mx-auto flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
          {PIPELINE.map((step, i) => (
            <span
              key={step}
              className="flex items-center gap-x-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {i > 0 && (
                <span aria-hidden className="text-coolant">
                  →
                </span>
              )}
              {step}
            </span>
          ))}
          <span className="ml-auto hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
            <span className="rec-blink text-rec">●</span> LIVE
          </span>
        </div>
      </div>
    </section>
  );
}
