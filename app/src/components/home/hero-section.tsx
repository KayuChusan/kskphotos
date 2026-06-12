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
          Photography Portfolio
        </motion.p>
        <motion.h1
          className="mt-5 font-heading text-6xl font-medium tracking-wide md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          KSK Works
        </motion.h1>
        <motion.p
          className="mt-5 font-heading text-xl italic text-white/70 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Capturing moments, telling stories
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
            View Gallery
          </Link>
          <Link
            href="/booking"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              // 写真の上に置くため、ライトテーマの bg-background を透過で上書き
              "border-white/50 bg-transparent font-mono text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white/10 hover:text-white"
            )}
          >
            Book a Shoot
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity: textOpacity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="exif-text text-white/40">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
