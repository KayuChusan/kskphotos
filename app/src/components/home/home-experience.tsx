"use client";

/**
 * HOME — 生きているポスター（/lab → /lab2 → 本編昇格）
 *
 * コンセプト「写したあとが、強い。」を、絞り→表紙(HALF BLEED)→概念→
 * シャッター→フィルム送り(3本柱+実価格)→色面CTA(次の一コマ)、の一冊として構成:
 *  - 色は @theme トークン参照（生 oklch 直書きは装飾の一部のみ）。
 *    青の見せ場は .slam / .bluehour の局所トークン再定義パターン（AA 実測済み）
 *  - 和文は 12px 以上・等幅に載せない（mono は欧文/数字のみ）
 *  - タッチターゲット 44px・focus-visible・reduced-motion フォールバック
 *  - トップページの義務: 3本柱の説明・実価格・導線をフィルムアドバンスに内蔵
 *  - 堅牢化原則: アニメ不発でも必ず見える（opacity 常時1・イントロ保険）
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeContactForm } from "@/components/home/home-contact-form";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";

export type LabPhoto = {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;

function photoUrl(p: LabPhoto | undefined) {
  return p ? (p.thumbnailUrl ?? p.imageUrl) : undefined;
}

/* ------------------------------ カスタムカーソル ------------------------------ */

function FocusCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      if (!active) setActive(true);
      const el = ref.current;
      if (el) {
        el.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [active]);

  if (!active) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden size-10 mix-blend-difference md:block"
    >
      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-white" />
      <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-white" />
      <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-white" />
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-white" />
      <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </div>
  );
}

/* ----------------------------- 絞りオープニング ----------------------------- */

function ApertureIntro({ reduce }: { reduce: boolean }) {
  const [done, setDone] = useState(reduce);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2600);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="iris"
        className="fixed inset-0 z-[60] flex items-center justify-center"
        style={{ backgroundColor: "var(--ink)" }}
        initial={{ clipPath: "circle(140% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.55 }}
        onAnimationComplete={() => setDone(true)}
      >
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.4em] text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.25, 0.7, 1] }}
        >
          <span className="rec-blink mr-3 inline-block" style={{ color: "var(--rec)" }}>
            ●
          </span>
          KSK WORKS
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------- 表紙: HALF BLEED（/lab3 COVER C 採用・写真と文字の衝突） ------------- */

/** 1文字ずつ組まれる横組みステートメント（改行は句読点で制御・opacity 常時1） */
function KineticLine({
  text,
  className,
  reduce,
  delay = 0.3,
}: {
  text: string;
  className?: string;
  reduce: boolean;
  delay?: number;
}) {
  return (
    <motion.span
      className={className}
      style={{ display: "block" }}
      initial={reduce ? undefined : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: delay } },
      }}
    >
      {text.split("").map((c, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          variants={
            reduce
              ? {}
              : {
                  hidden: { opacity: 1, y: "0.35em", rotate: 4 },
                  show: {
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                    transition: { duration: 0.55, ease: EASE },
                  },
                }
          }
        >
          {c}
        </motion.span>
      ))}
    </motion.span>
  );
}

function Cover({ photos, reduce }: { photos: LabPhoto[]; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const stampY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const main = photos[0];

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-background"
    >
      {/* 右半分 — 実写の全高ブリード（写真家の顔が最も立つ） */}
      {photoUrl(main) && (
        <motion.div
          className="absolute inset-y-0 right-0 w-[58%] bg-muted md:w-[52%]"
          style={reduce ? undefined : { y: photoY, scale: 1.08 }}
        >
          <Image
            src={photoUrl(main)!}
            alt=""
            fill
            className="object-cover"
            sizes="55vw"
            priority
            fetchPriority="high"
          />
          {/* 写真端のフィルムパーフォレーション */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-3 bg-[oklch(0.13_0.01_75)]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0 6px, oklch(0.9 0.005 85 / 0.9) 6px 13px, transparent 13px 19px)",
            }}
          />
          <span className="exif-text absolute bottom-4 right-4 text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            <span className="text-[oklch(0.72_0.2_29)]">●</span> RAW — ON SET
          </span>
        </motion.div>
      )}

      {/* ステートメント — 写真へ食い込む（生成りの縁取りで両面の可読を担保）。
          改行は「写したあとが、」/「強い。」の句読点折り */}
      <h1
        className="statement-jp relative z-10 w-full px-5 md:px-10"
        style={{
          textShadow:
            "0.04em 0 0 var(--background), -0.04em 0 0 var(--background), 0 0.04em 0 var(--background), 0 -0.04em 0 var(--background)",
        }}
      >
        <KineticLine
          text="写したあとが、"
          reduce={reduce}
          className="text-[clamp(3rem,11vw,10rem)] leading-[1.1]"
        />
        <KineticLine
          text="強い。"
          reduce={reduce}
          delay={0.65}
          className="text-[clamp(3.5rem,15vw,13rem)] leading-[1.05]"
        />
      </h1>

      {/* 誌面クレジット（欧文 mono のみ） */}
      <div className="absolute bottom-10 left-5 z-10 font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-muted-foreground md:left-10">
        <p>
          <span className="rec-blink mr-2 inline-block text-rec">●</span>
          SHOOT / BUILD / KEEP RUNNING
        </p>
        <p>KSKWORKS.JP — 2026</p>
      </div>

      <motion.div
        style={reduce ? undefined : { y: stampY }}
        className="tape absolute right-6 top-24 z-10 rotate-3 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] md:right-10"
      >
        KSK WORKS — 2026
      </motion.div>

      <p className="absolute bottom-10 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:right-10">
        SCROLL TO SHOOT ↓
      </p>
    </section>
  );
}

/* --------------------- シャッター・スクラブ（撮る、を体験する） --------------------- */

function ShutterScrub({ photos, reduce }: { photos: LabPhoto[]; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIdx(Math.min(2, Math.floor(v * 3)));
  });

  const bracket = useTransform(
    scrollYProgress,
    [0, 0.3, 0.334, 0.63, 0.667, 0.96, 1],
    [1.18, 1, 1.18, 1, 1.18, 1, 1]
  );
  const blur = useTransform(
    scrollYProgress,
    [0, 0.28, 0.334, 0.61, 0.667, 0.94, 1],
    ["blur(10px)", "blur(0px)", "blur(10px)", "blur(0px)", "blur(10px)", "blur(0px)", "blur(0px)"]
  );
  const flash = useTransform(
    scrollYProgress,
    [0, 0.3, 0.315, 0.33, 0.63, 0.645, 0.66, 0.96, 0.975, 0.99, 1],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
  );
  const printAt = [0.315, 0.645, 0.975];
  const prints = [
    useTransform(scrollYProgress, [printAt[0], printAt[0] + 0.02], [0, 1]),
    useTransform(scrollYProgress, [printAt[1], printAt[1] + 0.02], [0, 1]),
    useTransform(scrollYProgress, [printAt[2], printAt[2] + 0.02], [0, 1]),
  ];

  const three = photos.slice(0, 3);
  if (three.length === 0) return null;

  if (reduce) {
    return (
      <section className="bg-background px-6 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
          <span className="text-rec">●</span> CAPTURE 01–03
        </p>
        <div className="mt-8 flex flex-wrap gap-6">
          {three.map((p) => (
            <div key={p.id} className="w-56 bg-white p-2 pb-8 shadow-lg">
              <div className="relative aspect-[4/5]">
                <Image src={photoUrl(p)!} alt={p.title} fill className="object-cover" sizes="224px" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute left-6 top-20 z-10 md:left-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
            <span className="rec-blink mr-2 inline-block text-rec">●</span>
            CAPTURE {String(idx + 1).padStart(2, "0")} / 03
          </p>
          {/* 和文は等幅に載せず 12px 以上の別行で */}
          <p className="eyebrow-jp mt-1">スクロールでシャッターが落ちます</p>
        </div>

        <motion.div
          className="relative h-[62vmin] w-[62vmin] overflow-hidden md:h-[68vmin] md:w-[68vmin]"
          style={{ filter: blur }}
        >
          {three.map((p, i) => (
            <Image
              key={p.id}
              src={photoUrl(p)!}
              alt=""
              fill
              className="object-cover"
              style={{ opacity: idx === i ? 1 : 0 }}
              sizes="68vmin"
              priority={i === 0}
            />
          ))}
        </motion.div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute h-[66vmin] w-[66vmin] md:h-[72vmin] md:w-[72vmin]"
          style={{ scale: bracket }}
        >
          <span className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2" style={{ borderColor: "var(--rec)" }} />
          <span className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2" style={{ borderColor: "var(--rec)" }} />
          <span className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2" style={{ borderColor: "var(--rec)" }} />
          <span className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2" style={{ borderColor: "var(--rec)" }} />
        </motion.div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: flash }}
        />

        <div className="absolute bottom-6 right-4 flex md:bottom-10 md:right-10">
          {three.map((p, i) => (
            <motion.div
              key={p.id}
              className="-ml-10 w-24 bg-white p-1 pb-5 shadow-lg md:-ml-12 md:w-32 md:p-1.5 md:pb-7"
              style={{
                opacity: prints[i],
                scale: prints[i],
                rotate: (i - 1) * 7,
              }}
            >
              <div className="relative aspect-[4/5]">
                <Image src={photoUrl(p)!} alt="" fill className="object-cover" sizes="128px" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------- フィルムアドバンス — 一枚の写真の、その後（3本柱＋実価格） --------------- */

function FilmAdvance({ photos, reduce }: { photos: LabPhoto[]; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);
  const [headerDark, setHeaderDark] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setHeaderDark(v > 0.2);
  });

  // 物語の主役は「表紙で撮った、あの一枚」。3パネルで同じ写真が姿を変える
  const story = photos[0];
  const storyUrl = photoUrl(story);

  const panels = [
    {
      key: "toru",
      surface: "bg-background",
      word: "撮る。",
      en: "01 — CAPTURE",
      desc: "現場で、この一枚を撮る。空気ごと、高品質な写真で。",
      price: "¥14,000〜 / 1H",
      href: "/services",
      link: "料金・メニュー",
    },
    {
      key: "tsukuru",
      surface: "slam",
      word: "つくる。",
      en: "02 — BUILD",
      desc: "同じ一枚が、サイトの主役になる。設計から実装・公開まで。",
      price: "¥128,000〜",
      href: "/services",
      link: "料金・メニュー",
    },
    {
      key: "sasaeru",
      surface: "bluehour",
      word: "ささえる。",
      en: "03 — KEEP RUNNING",
      desc: "公開したその一枚を、止めない。運用・保守を継続サポート。",
      price: "¥11,000〜 / 月額",
      href: "/contact",
      link: "相談する",
    },
  ] as const;

  /** 01 — 現場の生写真（ブラケット＋EXIF＝撮られた瞬間） */
  const RawShot = () =>
    storyUrl ? (
      <div className="relative h-[44vmin] w-[33vmin] -rotate-2 bg-white p-[0.8vmin] pb-[4vmin] shadow-xl">
        <div className="relative h-full w-full overflow-hidden bg-muted">
          <Image src={storyUrl} alt="" fill className="object-cover" sizes="33vmin" />
          <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2" style={{ borderColor: "var(--rec)" }} />
          <span className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2" style={{ borderColor: "var(--rec)" }} />
          <span className="exif-text absolute bottom-2 left-2 text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            <span className="text-[oklch(0.72_0.2_29)]">●</span> RAW — ON SET
          </span>
        </div>
        <span className="exif-text absolute bottom-[1.2vmin] left-[1vmin] text-[oklch(0.45_0.01_75)]">
          NO.001 — SELECTED
        </span>
      </div>
    ) : null;

  /** 02 — 同じ一枚がサイトの主役に（ブラウザの中のヒーロー） */
  const BuiltSite = () =>
    storyUrl ? (
      <div className="w-[52vmin] max-w-[86vw] border bg-card shadow-xl">
        <div className="flex items-center gap-1.5 border-b px-3 py-2">
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="exif-text ml-2 truncate text-muted-foreground">
            kskworks.jp — YOUR SITE
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image src={storyUrl} alt="" fill className="object-cover object-[50%_35%]" sizes="52vmin" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* あの一枚の上に組まれる誌面（見出し・本文・CTA のスケルトン） */}
          <div className="absolute inset-x-4 bottom-3">
            <div className="h-[2.2vmin] w-1/2 rounded-full bg-white/90" />
            <div className="mt-[0.8vmin] h-[1.4vmin] w-1/3 rounded-full bg-white/60" />
            <div className="mt-[1.2vmin] h-[2.6vmin] w-[10vmin] rounded-sm bg-[oklch(0.84_0.16_85)]" />
          </div>
        </div>
      </div>
    ) : null;

  /** 03 — その一枚が動きつづける（サイト稼働＋コンソール） */
  const RunningSite = () => (
    <div className="relative w-[52vmin] max-w-[86vw]">
      {storyUrl && (
        <div className="w-[70%] border bg-card shadow-xl">
          <div className="flex items-center gap-1.5 border-b px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            <span className="exif-text ml-2 truncate text-muted-foreground">
              kskworks.jp
            </span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <Image src={storyUrl} alt="" fill className="object-cover object-[50%_35%]" sizes="36vmin" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-x-3 bottom-2">
              <div className="h-[1.6vmin] w-1/2 rounded-full bg-white/85" />
            </div>
          </div>
        </div>
      )}
      {/* 稼働コンソール — 公開後の心拍 */}
      <div className="bluehour absolute -bottom-[6vmin] right-0 w-[62%] overflow-hidden rounded-md border shadow-xl">
        <div className="flex items-center gap-1.5 border-b px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="exif-text ml-1.5 text-muted-foreground">ksk@works: ~</span>
        </div>
        <div className="space-y-1 px-3 py-2.5 font-mono text-[11px] leading-relaxed">
          <p className="text-muted-foreground">
            <span className="text-coolant">$</span> keep --running
          </p>
          <p className="text-foreground">
            <span className="text-[oklch(0.8_0.17_150)]">●</span> active (running)
            <span className="ml-1 inline-block w-1.5 animate-pulse bg-coolant">&nbsp;</span>
          </p>
          <p className="text-muted-foreground">uptime 100% — backup ok</p>
        </div>
      </div>
    </div>
  );

  const visuals = [RawShot, BuiltSite, RunningSite] as const;

  const PanelBody = ({ p, i }: { p: (typeof panels)[number]; i: number }) => {
    const Visual = visuals[i];
    return (
      <>
        {/* 巨大アウトライン番号 — 画面端で切る（装飾） */}
        <span
          aria-hidden
          className="absolute -left-6 top-1/2 -translate-y-1/2 select-none font-mono text-[46vmin] font-bold leading-none opacity-20"
          style={{ WebkitTextStroke: "2px var(--foreground)", color: "transparent" }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>

        <div className="-mt-[6vmin]">
          <Visual />
        </div>

        <p className="statement-jp absolute top-[13%] text-[clamp(3rem,12vmin,8rem)]">
          {p.word}
        </p>

        {/* トップページの義務 — 説明・実価格・導線（タッチ44px） */}
        <div className="absolute bottom-[7%] left-1/2 w-[86vw] max-w-md -translate-x-1/2 text-center">
          <p className="text-sm leading-relaxed text-foreground-soft">{p.desc}</p>
          <p className="mt-2 font-mono text-2xl font-medium tabular-nums">{p.price}</p>
          <Link
            href={p.href}
            className="mt-1 inline-flex min-h-11 items-center px-4 font-mono text-xs tracking-[0.14em] underline underline-offset-8 transition-colors hover:opacity-80"
          >
            {p.link} →
          </Link>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            {p.en}
          </p>
        </div>
      </>
    );
  };

  if (reduce) {
    return (
      <section>
        <div className="bg-background px-6 pt-16">
          <p className="eyebrow">One Photo — Shoot to Run</p>
          <p className="eyebrow-jp mt-1">一枚の写真が、サイトになり、動きつづけるまで。</p>
        </div>
        {panels.map((p, i) => (
          <div
            key={p.key}
            className={`relative flex min-h-[80vh] items-center justify-center overflow-hidden ${p.surface === "bg-background" ? "bg-background" : p.surface}`}
          >
            <PanelBody p={p} i={i} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      data-header-dark={headerDark ? "" : undefined}
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="flex h-full w-[300vw]" style={{ x }}>
          {panels.map((p, i) => (
            <div
              key={p.key}
              className={`relative flex h-full w-screen items-center justify-center overflow-hidden ${p.surface === "bg-background" ? "bg-background" : p.surface}`}
            >
              <PanelBody p={p} i={i} />
            </div>
          ))}
        </motion.div>

        {/* 物語のラベル — この3面は「同じ一枚」の話 */}
        <div className="pointer-events-none absolute left-6 top-20 md:left-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] mix-blend-difference">
            <span className="text-white">ONE PHOTO — SHOOT TO RUN</span>
          </p>
        </div>
        <div className="pointer-events-none absolute right-6 top-20 font-mono text-[10px] uppercase tracking-[0.3em] mix-blend-difference md:right-10">
          <span className="text-white">FILM ADVANCE →</span>
        </div>
      </div>
    </section>
  );
}

/* --------------- コンタクト — 受付用紙（そのまま送れる・実物のフォーム） --------------- */

function ColorSlam() {
  return (
    <section data-header-dark className="slam relative overflow-hidden py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* 用件 — 断言と補助導線 */}
          <div>
            <p className="eyebrow">
              <span className="rec-blink mr-2 inline-block" style={{ color: "var(--film)" }}>
                ●
              </span>
              Contact
            </p>
            <h2 className="statement-jp mt-4 text-3xl md:text-5xl">
              まずは、お気軽に
              <br className="sm:hidden" />
              ご相談ください。
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-soft md:text-base">
              撮影・Web 制作・IT サポートのこと、なんでもどうぞ。
              このままフォームから送れます。
            </p>

            <div className="mt-10 space-y-3 text-sm">
              <p className="text-foreground-soft">
                メール派の方は{" "}
                <a
                  href="mailto:info@kskworks.jp"
                  className="inline-flex min-h-11 items-center font-mono text-xs tracking-[0.1em] underline underline-offset-4 hover:opacity-80"
                >
                  info@kskworks.jp
                </a>{" "}
                へどうぞ。
              </p>
              <p>
                <Link
                  href="/services"
                  className="inline-flex min-h-11 items-center font-mono text-xs tracking-[0.14em] underline underline-offset-8 transition-colors hover:opacity-80"
                >
                  先に料金を見る →
                </Link>
              </p>
            </div>
          </div>

          {/* 受付用紙 — 実物のフォーム（/contact と同じ Server Action） */}
          <div className="flex justify-center lg:justify-end">
            <HomeContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- 概念 — 撮影で終わらない、という宣言 ------------------------- */

function Concept() {
  return (
    <section className="bg-surface-sink">
      <div className="container mx-auto px-4 py-24">
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
                <dd className="exif-text">個人・法人・政治団体 — お支払いは柔軟に対応</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- 本体 ---------------------------------- */

export function HomeExperience({ photos }: { photos: LabPhoto[] }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="bg-background">
      <FocusCursor />
      <ApertureIntro reduce={reduce} />
      <Cover photos={photos} reduce={reduce} />
      <Concept />
      <ShutterScrub photos={photos} reduce={reduce} />
      <FilmAdvance photos={photos} reduce={reduce} />
      <ColorSlam />
    </div>
  );
}
