"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { DecodeText } from "@/components/decode-text";
import { cn } from "@/lib/utils";
import type { Photo } from "@/generated/prisma/client";

interface HeroSectionProps {
  photos: Photo[];
}

/** ファインダーHUD風のEXIF表示 */
function HudCorner({
  className,
  children,
  delay,
}: {
  className: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      className={cn(
        "exif-text pointer-events-none absolute z-10 text-white/50",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection({ photos }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <section
      ref={containerRef}
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Parallax photo */}
      {main && (
        <motion.div
          className="absolute inset-0"
          style={{ y: bgY, scale: bgScale }}
        >
          {/* Blurred fill for letterbox areas */}
          <Image
            src={main.imageUrl}
            alt=""
            fill
            className="scale-110 object-cover blur-2xl brightness-[0.35]"
            sizes="100vw"
            priority
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
        style={{ opacity: overlayOpacity }}
      />

      {/* Viewfinder frame */}
      <div className="pointer-events-none absolute inset-x-5 bottom-5 top-[4.75rem] z-10 hidden md:block">
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-white/40" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-white/40" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-white/40" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-white/40" />
      </div>

      {/* HUD — 実際のEXIFをファインダー表示風に、起動時の計器のようにデコード */}
      {main && (
        <>
          <HudCorner className="left-10 top-24 hidden md:block" delay={1.2}>
            <DecodeText text={main.cameraModel ?? "—"} delay={1.2} />
          </HudCorner>
          <HudCorner
            className="right-10 top-24 hidden text-right md:block"
            delay={1.4}
          >
            <DecodeText text={main.lensModel ?? "—"} delay={1.4} />
          </HudCorner>
          <HudCorner className="bottom-10 left-10 hidden md:block" delay={1.6}>
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
          >
            <DecodeText text={main.location ?? "Tokyo, JP"} delay={1.8} />
          </HudCorner>
        </>
      )}

      {/* Center content */}
      <motion.div
        className="relative z-10 px-4 text-center"
        style={{ y: textY, opacity: textOpacity }}
      >
        <motion.p
          className="eyebrow text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="mr-2 inline-block animate-pulse text-[oklch(0.80_0.13_70)]">
            ●
          </span>
          REC — Photography / Web / IT
        </motion.p>

        {/* タイトル: ファインダー枠の中で、印画紙に像が浮かぶように現像される */}
        <div className="relative mt-5 inline-block px-8 py-6 md:px-14 md:py-9">
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 1.2 }}
            aria-hidden
          >
            <span className="absolute left-0 top-0 h-5 w-5 border-l-[1.5px] border-t-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
            <span className="absolute right-0 top-0 h-5 w-5 border-r-[1.5px] border-t-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
            <span className="absolute bottom-0 left-0 h-5 w-5 border-b-[1.5px] border-l-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
            <span className="absolute bottom-0 right-0 h-5 w-5 border-b-[1.5px] border-r-[1.5px] border-[oklch(0.80_0.13_70/0.85)]" />
          </motion.div>
          <motion.h1
            className="bg-gradient-to-br from-white via-white to-[oklch(0.82_0.13_70)] bg-clip-text font-heading text-6xl font-medium tracking-wide text-transparent md:text-8xl lg:text-9xl"
            initial={{ opacity: 0, y: 30, filter: "blur(16px) brightness(0.3)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px) brightness(1)" }}
            transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
          >
            KSK Works
          </motion.h1>
        </div>
        <motion.p
          className="mt-5 font-heading text-2xl font-medium text-white/85 md:text-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          撮る、つくる、ささえる。
        </motion.p>
        <motion.p
          className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65 md:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.72 }}
        >
          写真撮影から Web サイトの制作・運用まで、ひとつの窓口で。
        </motion.p>
        <motion.div
          className="mt-9 flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
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

      {/* Scroll indicator — 下端の現像グラデ(生成り)の上に置き、暗い写真上で読めるようにする */}
      <motion.div
        className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity: textOpacity }}
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
