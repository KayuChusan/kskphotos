"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { DecodeText } from "@/components/decode-text";
import { cn } from "@/lib/utils";
import type { Photo } from "@/generated/prisma/client";

interface HeroSectionProps {
  photos: Photo[];
}

// 上質でなめらかな減速（easeOutExpo 系）。世界観＝静謐・上質に合わせた共通イージング。
const EASE = [0.16, 1, 0.3, 1] as const;

/** ファインダーHUD風のEXIF表示 */
function HudCorner({
  className,
  children,
  delay,
  reduce,
}: {
  className: string;
  children: React.ReactNode;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "exif-text pointer-events-none absolute z-10 text-white/50",
        className
      )}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection({ photos }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.35, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const main = photos[0];

  // 「露光 → 現像」の段階的リビール。reduced-motion 時は変形・ブラーを避け即時表示。
  const group: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
        delayChildren: reduce ? 0 : 0.35,
      },
    },
  };
  // 「持ち上がり」演出（アイブロウ・コピー・ボタン）。
  // LCP 要素であるコピーを即描画させるため opacity は最初から 1 にし、
  // 入場は y のスライドのみにする（opacity フェードを残すと LCP が数秒遅れる）。
  const rise: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 1, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
      };
  // タイトル＝印画紙に像が結ぶ「現像」。ブラー・露出・字間が締まりながら浮かぶ。
  const develop: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: {
          opacity: 1,
          y: 26,
          filter: "blur(20px) brightness(0.35)",
          letterSpacing: "0.22em",
        },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px) brightness(1)",
          letterSpacing: "0.02em",
          transition: { duration: 1.7, ease: EASE },
        },
      };
  // ファインダー枠が絞り込まれる（カメラがピントを合わせる）
  const focusFrame: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, scale: 1.12 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { duration: 1.1, ease: EASE },
        },
      };
  const passthrough: Variants = { hidden: {}, show: {} };

  return (
    <section
      ref={containerRef}
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Parallax photo（スクロール視差）＋ 入場は露光フェード */}
      {main && (
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { y: bgY, scale: bgScale }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          {/* Blurred fill for letterbox areas
              — 追加の画像リクエストを避け、軽量な blur プレースホルダ(data URL)を
                拡大表示してレターボックスの帯を埋める。LCP 画像はシャープ版のみ。 */}
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-black bg-cover bg-center blur-2xl brightness-[0.35]"
            style={
              main.blurDataUrl
                ? { backgroundImage: `url(${main.blurDataUrl})` }
                : undefined
            }
          />
          {/* Sharp main photo — fully visible */}
          <Image
            src={main.imageUrl}
            alt=""
            fill
            placeholder={main.blurDataUrl ? "blur" : "empty"}
            blurDataURL={main.blurDataUrl ?? undefined}
            className="object-contain brightness-[0.8]"
            sizes="100vw"
            priority
          />
        </motion.div>
      )}

      {/* Scroll-reactive dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={reduce ? { opacity: 0.35 } : { opacity: overlayOpacity }}
      />

      {/* Viewfinder frame — 起動時にコーナーが絞り込まれる */}
      <motion.div
        className="pointer-events-none absolute inset-x-5 bottom-5 top-[4.75rem] z-10 hidden md:block"
        variants={focusFrame}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-white/40" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-white/40" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-white/40" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-white/40" />
      </motion.div>

      {/* HUD — 実際のEXIFをファインダー表示風に、起動時の計器のようにデコード */}
      {main && (
        <>
          <HudCorner
            className="left-10 top-24 hidden md:block"
            delay={1.2}
            reduce={reduce}
          >
            <DecodeText text={main.cameraModel ?? "—"} delay={1.2} />
          </HudCorner>
          <HudCorner
            className="right-10 top-24 hidden text-right md:block"
            delay={1.4}
            reduce={reduce}
          >
            <DecodeText text={main.lensModel ?? "—"} delay={1.4} />
          </HudCorner>
          <HudCorner
            className="bottom-10 left-10 hidden md:block"
            delay={1.6}
            reduce={reduce}
          >
            <span className="text-safelight">●</span>{" "}
            <DecodeText
              text={[
                main.aperture ? `f/${main.aperture}` : null,
                main.shutterSpeed ? `${main.shutterSpeed}s` : null,
                main.iso ? `ISO ${main.iso}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              delay={1.6}
            />
          </HudCorner>
          <HudCorner
            className="bottom-10 right-10 hidden text-right md:block"
            delay={1.8}
            reduce={reduce}
          >
            <DecodeText text={main.location ?? "Tokyo, JP"} delay={1.8} />
          </HudCorner>
        </>
      )}

      {/* Center content — スクロールで退場フェード（外側）＋ 入場は段階的リビール（内側） */}
      <motion.div
        className="relative z-10 px-4 text-center"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.div
          variants={group}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <motion.p variants={rise} className="eyebrow text-white/60">
            <span className="mr-2 inline-block animate-pulse text-[oklch(0.80_0.13_70)]">
              ●
            </span>
            REC — Photography / Web / IT
          </motion.p>

          {/* タイトル: ファインダー枠の中で、印画紙に像が浮かぶように現像される */}
          <motion.div
            variants={passthrough}
            className="relative mt-5 inline-block px-8 py-6 md:px-14 md:py-9"
          >
            <motion.div
              className="pointer-events-none absolute inset-0"
              variants={focusFrame}
              aria-hidden
            >
              <span className="absolute left-0 top-0 h-5 w-5 border-l-[1.5px] border-t-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
              <span className="absolute right-0 top-0 h-5 w-5 border-r-[1.5px] border-t-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
              <span className="absolute bottom-0 left-0 h-5 w-5 border-b-[1.5px] border-l-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
              <span className="absolute bottom-0 right-0 h-5 w-5 border-b-[1.5px] border-r-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
            </motion.div>
            <motion.h1
              variants={develop}
              className="bg-gradient-to-br from-white via-white to-[oklch(0.82_0.13_70)] bg-clip-text font-heading text-6xl font-medium tracking-wide text-transparent md:text-8xl lg:text-9xl"
            >
              KSK Works
            </motion.h1>
          </motion.div>

          <motion.p
            variants={rise}
            className="tagline-jp mt-5 text-2xl font-semibold text-white/85 md:text-3xl"
          >
            撮る、つくる、ささえる。
          </motion.p>
          <motion.p
            variants={rise}
            className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65 md:text-base"
          >
            写真撮影から Web サイトの制作・運用まで、ひとつの窓口で。
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex justify-center gap-4">
            <Link
              href="/gallery"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white font-mono text-[11px] uppercase tracking-[0.2em] text-black hover:bg-white/90"
              )}
            >
              ギャラリーを見る
            </Link>
            <Link
              href="/booking"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                // 写真の上に置くため、ライトテーマの bg-background を透過で上書き
                "border-white/50 bg-transparent font-mono text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white/10 hover:text-white"
              )}
            >
              撮影を依頼する
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — 下端の現像グラデ(生成り)の上に置き、暗い写真上で読めるようにする */}
      <motion.div
        className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={reduce ? undefined : { opacity: textOpacity }}
      >
        <div className="flex flex-col items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          <span className="exif-text text-white/70">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
        </div>
      </motion.div>

      {/* 暗室 → 印画紙の「現像」受け渡し — 下端を本文(生成り)背景へ溶かし、
          スクロールで暗室から印画紙へ像が結ぶように継ぎ目をなくす */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-16 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
