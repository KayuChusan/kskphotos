"use client";

/**
 * LAB 02 — 生きているポスター（本編品質版）
 *
 * /lab のコンセプト（絞り→シャッター→フィルム送り→色面）を基準に、
 * 本編（DESIGN.md）の品質規律へ翻訳した版:
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
          KSK WORKS — LAB 02
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------- 表紙: グリフマスク × 縦組み ------------------------- */

function Cover({ photos, reduce }: { photos: LabPhoto[]; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const glyphY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const stampY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const chars = "写したあとが、強い。".split("");

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-background"
    >
      {/* 巨大グリフ「写」— 字の中に実写が流れる */}
      <div className="absolute -left-[8%] top-1/2 w-[78vmin] -translate-y-1/2 md:-left-[4%] md:w-[86vmin]">
        <svg viewBox="0 0 100 100" className="block w-full">
          <defs>
            <clipPath id="lab2-glyph">
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="88"
                style={{ fontFamily: "'Statement JP', sans-serif", fontWeight: 900 }}
              >
                写
              </text>
            </clipPath>
          </defs>
          {photoUrl(photos[0]) && (
            <motion.g style={reduce ? undefined : { y: glyphY }}>
              <image
                href={photoUrl(photos[0])}
                x="-10"
                y="-10"
                width="120"
                height="120"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#lab2-glyph)"
              />
            </motion.g>
          )}
          {/* 見当ズレの複線（ブランド青）＋ 墨の主線 */}
          <text
            x="50.8"
            y="50.6"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="88"
            fill="none"
            stroke="var(--brand-blue)"
            strokeWidth="0.35"
            style={{ fontFamily: "'Statement JP', sans-serif", fontWeight: 900 }}
          >
            写
          </text>
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="88"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.5"
            style={{ fontFamily: "'Statement JP', sans-serif", fontWeight: 900 }}
          >
            写
          </text>
        </svg>
      </div>

      {/* 縦組みステートメント（「強」はブランド青＝大字なので 3:1 域で可） */}
      <motion.h1
        className="statement-jp absolute right-[10%] top-1/2 -translate-y-1/2 text-[clamp(3rem,9vmin,5.5rem)] leading-[1.08] md:right-[16%]"
        style={{ writingMode: "vertical-rl" }}
        initial={reduce ? undefined : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 1.5 } },
        }}
      >
        {chars.map((c, i) => (
          <motion.span
            key={i}
            className={c === "強" ? "text-brand-blue" : undefined}
            style={{ display: "inline-block" }}
            variants={
              reduce
                ? {}
                : {
                    hidden: { opacity: 1, rotate: 8, y: -14 },
                    show: {
                      opacity: 1,
                      rotate: 0,
                      y: 0,
                      transition: { duration: 0.5, ease: EASE },
                    },
                  }
            }
          >
            {c}
          </motion.span>
        ))}
      </motion.h1>

      {/* 誌面クレジット（欧文 mono のみ・和文なし） */}
      <div className="absolute left-5 top-24 font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-muted-foreground md:left-10">
        <p>
          <span className="rec-blink mr-2 inline-block text-rec">●</span>
          LAB ISSUE 02 — PRODUCTION GRADE
        </p>
        <p>SHOOT / BUILD / KEEP RUNNING</p>
        <p>KSKWORKS.JP — 2026</p>
      </div>

      <motion.div
        style={reduce ? undefined : { y: stampY }}
        className="tape absolute bottom-[14%] right-[6%] rotate-6 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em]"
      >
        RULES APPLIED — STILL ALIVE
      </motion.div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
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

/* ------------------- フィルムアドバンス（3本柱＝トップの義務を内蔵） ------------------- */

function FilmAdvance({ photos, reduce }: { photos: LabPhoto[]; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);
  // 横送りで暗いパネル（slam/bluehour）が主景になったらヘッダーへダーク信号を出す
  // （SiteHeader は [data-header-dark] を監視しているため、属性を動的に付け外す）
  const [headerDark, setHeaderDark] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setHeaderDark(v > 0.2);
  });

  const panels = [
    {
      key: "toru",
      surface: "bg-background",
      word: "撮る。",
      en: "01 — CAPTURE",
      desc: "現場の空気ごと、高品質な写真で記録します。",
      price: "¥14,000〜 / 1H",
      href: "/services",
      link: "料金・メニュー",
      photo: photos[3] ?? photos[0],
    },
    {
      key: "tsukuru",
      surface: "slam",
      word: "つくる。",
      en: "02 — BUILD",
      desc: "写真が働く Web を、設計から実装・公開まで。",
      price: "¥128,000〜",
      href: "/services",
      link: "料金・メニュー",
      photo: photos[4] ?? photos[1],
    },
    {
      key: "sasaeru",
      surface: "bluehour",
      word: "ささえる。",
      en: "03 — KEEP RUNNING",
      desc: "公開後も、止めない。運用・保守を継続サポート。",
      price: "¥11,000〜 / 月額",
      href: "/contact",
      link: "相談する",
      photo: photos[5] ?? photos[2],
    },
  ] as const;

  const PanelBody = ({ p, i }: { p: (typeof panels)[number]; i: number }) => (
    <>
      {/* 巨大アウトライン番号 — 画面端で切る（装飾） */}
      <span
        aria-hidden
        className="absolute -left-6 top-1/2 -translate-y-1/2 select-none font-mono text-[46vmin] font-bold leading-none opacity-20"
        style={{ WebkitTextStroke: "2px var(--foreground)", color: "transparent" }}
      >
        {String(i + 1).padStart(2, "0")}
      </span>

      {photoUrl(p.photo) && (
        <div className="relative -mt-[8vmin] h-[42vmin] w-[31vmin] overflow-hidden shadow-xl">
          <Image src={photoUrl(p.photo)!} alt="" fill className="object-cover" sizes="31vmin" />
        </div>
      )}

      <p className="statement-jp absolute top-[16%] text-[clamp(3.5rem,13vmin,8.5rem)]">
        {p.word}
      </p>

      {/* トップページの義務 — 説明・実価格・導線（タッチ44px） */}
      <div className="absolute bottom-[10%] left-1/2 w-[86vw] max-w-md -translate-x-1/2 text-center">
        <p className="text-sm leading-relaxed text-foreground-soft">{p.desc}</p>
        <p className="mt-2 font-mono text-2xl font-medium tabular-nums">{p.price}</p>
        <Link
          href={p.href}
          className="mt-2 inline-flex min-h-11 items-center px-4 font-mono text-xs tracking-[0.14em] underline underline-offset-8 transition-colors hover:opacity-80"
        >
          {p.link} →
        </Link>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          {p.en}
        </p>
      </div>
    </>
  );

  if (reduce) {
    return (
      <section>
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

        <div className="pointer-events-none absolute right-6 top-20 font-mono text-[10px] uppercase tracking-[0.3em] mix-blend-difference md:right-10">
          <span className="text-white">FILM ADVANCE →</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- カラースラム（色面×逆走マーキー） ------------------------- */

function ColorSlam() {
  return (
    <section data-header-dark className="slam relative overflow-hidden py-28">
      <div className="marquee" aria-hidden>
        <div className="marquee-track" style={{ animationDuration: "16s" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="statement-jp shrink-0 whitespace-nowrap text-7xl md:text-8xl"
              style={{ WebkitTextStroke: "2px var(--foreground)", color: "transparent" }}
            >
              写したあとが、強い。
            </span>
          ))}
        </div>
      </div>
      <div className="marquee mt-4" aria-hidden>
        <div
          className="marquee-track"
          style={{ animationDuration: "22s", animationDirection: "reverse" }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className="shrink-0 whitespace-nowrap font-mono text-6xl font-bold uppercase tracking-tight md:text-7xl"
              style={{ color: i % 3 === 0 ? "var(--film)" : "var(--foreground)" }}
            >
              KEEP RUNNING —
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <Link
          href="/contact"
          className="tape statement-jp -rotate-3 px-10 py-5 text-2xl shadow-xl transition-transform hover:rotate-0 hover:scale-105 focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-3xl"
        >
          ご相談ください。
        </Link>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        <span className="rec-blink mr-2 inline-block" style={{ color: "var(--film)" }}>
          ●
        </span>
        FREE CONSULTATION — SHOOT / BUILD / RUN
      </p>
    </section>
  );
}

/* ------------------------------- 奥付（コロフォン） ------------------------------- */

function Colophon() {
  const rows = [
    ["CONCEPT", "生きているポスター — 本編品質版"],
    ["PHOTO", "KSK WORKS(実写・実案件)"],
    ["TYPE", "Statement JP / Geist Mono"],
    ["MOTION", "APERTURE / SHUTTER SCRUB / FILM ADVANCE / MARQUEE"],
    ["RULES", "TOKENS / AA / 12PX+ / 44PX TOUCH / REDUCED-MOTION"],
    ["BUILD", "NEXT.JS 16 — CLOUD RUN"],
    ["STATUS", "EXPERIMENTAL — /lab2（基準は /lab）"],
  ];
  return (
    <section data-header-dark className="bluehour px-6 py-24 md:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        COLOPHON
      </p>
      <p className="eyebrow-jp mt-1">奥付</p>
      <dl className="mt-8 max-w-2xl space-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-6 border-b pb-3">
            <dt className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {k}
            </dt>
            <dd className="text-sm">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs tracking-[0.14em]">
        <Link
          href="/lab"
          className="inline-flex min-h-11 items-center underline underline-offset-8 transition-colors hover:text-foreground"
        >
          ← 基準（/lab）
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center underline underline-offset-8 transition-colors hover:text-foreground"
        >
          本編（トップ）へ
        </Link>
        <Link
          href="/gallery"
          className="inline-flex min-h-11 items-center underline underline-offset-8 transition-colors hover:text-foreground"
        >
          ギャラリー →
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------- 本体 ---------------------------------- */

export function Lab2Experience({ photos }: { photos: LabPhoto[] }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="bg-background">
      <FocusCursor />
      <ApertureIntro reduce={reduce} />
      <Cover photos={photos} reduce={reduce} />
      <ShutterScrub photos={photos} reduce={reduce} />
      <FilmAdvance photos={photos} reduce={reduce} />
      <ColorSlam />
      <Colophon />
    </div>
  );
}
