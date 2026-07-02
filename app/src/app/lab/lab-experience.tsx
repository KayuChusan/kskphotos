"use client";

/**
 * LAB — 生きているポスター（実験場・DESIGN.md 運用規律の適用外）
 *
 * コンセプト: 「絞りが開き、シャッターが落ち、フィルムが送られ、誌面が組み上がる」。
 * 広告ポスターの構図 A（巨大タイポ×実写の衝突）＋ E（色面）＋ F（反復）を、
 * スクロールという時間軸で連結した動くエディトリアル。
 *
 * モーション語彙:
 *  - アパーチャ・オープニング（絞り羽根が開いて誌面が現れる）
 *  - グリフマスク（巨大「写」の字の中に実写が流れる）
 *  - シャッター・スクラブ（スクロールでピントが合い、シャッターが落ち、プリントが積まれる)
 *  - フィルムアドバンス（縦スクロールを横送りに変換するピン留めスクラブ）
 *  - カラースラム（色面×逆走アウトライン・マーキー）
 *  - フォーカスブラケットのカスタムカーソル
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
// 公開してよい最小フィールドのみ（page.tsx の select と対）。フル Photo を受けない
export type LabPhoto = {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------- 素材 ---------------------------------- */

function photoUrl(p: LabPhoto | undefined) {
  return p ? (p.thumbnailUrl ?? p.imageUrl) : undefined;
}

/* ------------------------------ カスタムカーソル ------------------------------ */

function FocusCursor() {
  // 位置は state を介さず DOM 直書き（set-state-in-effect 回避＋毎フレーム再レンダー回避）
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
  // 保険: アニメーションが環境要因で発火しなくても必ず幕を上げる（黒画面ロック防止）
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2600);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="iris"
        className="fixed inset-0 z-[60] flex items-center justify-center bg-[oklch(0.14_0.01_75)]"
        initial={{ clipPath: "circle(140% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.55 }}
        onAnimationComplete={() => setDone(true)}
      >
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.4em] text-white/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.25, 0.7, 1] }}
        >
          <span className="rec-blink mr-3 inline-block text-[oklch(0.7_0.2_29)]">
            ●
          </span>
          KSK WORKS — LAB
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
  // グリフ内の写真だけが遅れて動く（文字は紙、写真は生き物）
  const glyphY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const stampY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const chars = "写したあとが、強い。".split("");

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[oklch(0.97_0.01_85)]"
    >
      {/* 巨大グリフ「写」— 字の中に実写が流れる（写真と文字の衝突） */}
      <div className="absolute -left-[8%] top-1/2 w-[78vmin] -translate-y-1/2 md:-left-[4%] md:w-[86vmin]">
        <svg viewBox="0 0 100 100" className="block w-full">
          <defs>
            <clipPath id="lab-glyph">
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
                clipPath="url(#lab-glyph)"
              />
            </motion.g>
          )}
          {/* アウトラインの複線 — 印刷の見当ズレ（違和感の設計） */}
          <text
            x="50.8"
            y="50.6"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="88"
            fill="none"
            stroke="oklch(0.55 0.22 262)"
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
            stroke="oklch(0.2 0.01 75)"
            strokeWidth="0.5"
            style={{ fontFamily: "'Statement JP', sans-serif", fontWeight: 900 }}
          >
            写
          </text>
        </svg>
      </div>

      {/* 縦組みステートメント — グリフに食い込む（1文字ずつ組まれる） */}
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
            className={c === "強" ? "text-[oklch(0.5_0.22_262)]" : undefined}
            style={{ display: "inline-block" }}
            variants={
              reduce
                ? {}
                : {
                    // opacity は常に 1（アニメ不発でも文字が消えない）
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

      {/* 誌面のクレジット（雑誌の扉ページ情報設計） */}
      <div className="absolute left-5 top-24 font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-[oklch(0.4_0.01_75)] md:left-10">
        <p>
          <span className="rec-blink mr-2 inline-block text-[oklch(0.6_0.23_29)]">
            ●
          </span>
          LAB ISSUE 01
        </p>
        <p>SHOOT / BUILD / KEEP RUNNING</p>
        <p>KSKWORKS.JP — 2026</p>
      </div>

      {/* フィルムイエローの切符 — 差し色（スクロールで先に逃げる） */}
      <motion.div
        style={reduce ? undefined : { y: stampY }}
        className="tape absolute bottom-[14%] right-[6%] rotate-6 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em]"
      >
        EXPERIMENTAL — NO RULES
      </motion.div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-[oklch(0.45_0.01_75)]">
        Scroll to shoot ↓
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

  // ピント: 各1/3の中でブラケットが絞り込まれる
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
  // シャッター: 1/3 の締めで一瞬だけ黒が落ちる
  const flash = useTransform(
    scrollYProgress,
    [0, 0.3, 0.315, 0.33, 0.63, 0.645, 0.66, 0.96, 0.975, 0.99, 1],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
  );
  // 撮れたプリントが右下に積まれる
  const printAt = [0.315, 0.645, 0.975];
  const prints = [
    useTransform(scrollYProgress, [printAt[0], printAt[0] + 0.02], [0, 1]),
    useTransform(scrollYProgress, [printAt[1], printAt[1] + 0.02], [0, 1]),
    useTransform(scrollYProgress, [printAt[2], printAt[2] + 0.02], [0, 1]),
  ];

  const three = photos.slice(0, 3);
  if (three.length === 0) return null;

  if (reduce) {
    // 低モーション環境: スクラブせず、撮れ高3枚の静的な棚
    return (
      <section className="bg-[oklch(0.97_0.01_85)] px-6 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
          ● CAPTURE 01–03
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
    <section ref={ref} className="relative h-[320vh] bg-[oklch(0.97_0.01_85)]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <p className="absolute left-6 top-20 z-10 font-mono text-[10px] uppercase tracking-[0.3em] md:left-10">
          <span className="rec-blink mr-2 inline-block text-[oklch(0.6_0.23_29)]">●</span>
          CAPTURE {String(idx + 1).padStart(2, "0")} / 03 — スクロールでシャッター
        </p>

        {/* ファインダー内の被写体 */}
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

        {/* フォーカスブラケット */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute h-[66vmin] w-[66vmin] md:h-[72vmin] md:w-[72vmin]"
          style={{ scale: bracket }}
        >
          <span className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-[oklch(0.6_0.23_29)]" />
          <span className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-[oklch(0.6_0.23_29)]" />
          <span className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-[oklch(0.6_0.23_29)]" />
          <span className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-[oklch(0.6_0.23_29)]" />
        </motion.div>

        {/* シャッター幕 */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: flash }}
        />

        {/* 撮れたプリントの棚 */}
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

/* ------------------- フィルムアドバンス（縦スクロール→横送り） ------------------- */

function FilmAdvance({ photos, reduce }: { photos: LabPhoto[]; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);

  const panels = [
    {
      key: "toru",
      word: "撮る。",
      en: "01 — CAPTURE",
      bg: "oklch(0.97 0.01 85)",
      ink: "oklch(0.2 0.01 75)",
      photo: photos[3] ?? photos[0],
    },
    {
      key: "tsukuru",
      word: "つくる。",
      en: "02 — BUILD",
      bg: "oklch(0.5 0.22 262)",
      ink: "oklch(0.98 0.005 262)",
      photo: photos[4] ?? photos[1],
    },
    {
      key: "sasaeru",
      word: "ささえる。",
      en: "03 — KEEP RUNNING",
      bg: "oklch(0.16 0.01 75)",
      ink: "oklch(0.97 0.005 85)",
      photo: photos[5] ?? photos[2],
    },
  ];

  if (reduce) {
    return (
      <section>
        {panels.map((p) => (
          <div key={p.key} className="px-6 py-20" style={{ backgroundColor: p.bg, color: p.ink }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">{p.en}</p>
            <p className="statement-jp mt-4 text-5xl" style={{ color: p.ink }}>
              {p.word}
            </p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="flex h-full w-[300vw]" style={{ x }}>
          {panels.map((p, i) => (
            <div
              key={p.key}
              className="relative flex h-full w-screen items-center justify-center overflow-hidden"
              style={{ backgroundColor: p.bg, color: p.ink }}
            >
              {/* 巨大アウトライン番号 — 画面端で切る */}
              <span
                aria-hidden
                className="absolute -left-6 top-1/2 -translate-y-1/2 select-none font-mono text-[46vmin] font-bold leading-none opacity-25"
                style={{ WebkitTextStroke: `2px ${p.ink}`, color: "transparent" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* 実写 — 誌面の中の窓 */}
              {photoUrl(p.photo) && (
                <div className="relative h-[52vmin] w-[38vmin] overflow-hidden shadow-xl">
                  <Image
                    src={photoUrl(p.photo)!}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="38vmin"
                  />
                </div>
              )}

              {/* 語 — 写真に重ねる（衝突） */}
              <p
                className="statement-jp absolute text-[clamp(3.5rem,14vmin,9rem)]"
                style={{ color: p.ink, textShadow: `0 0 0 transparent` }}
              >
                {p.word}
              </p>

              <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.35em] opacity-80">
                {p.en}
              </p>
            </div>
          ))}
        </motion.div>

        {/* フィルムカウンター */}
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
    <section className="relative overflow-hidden bg-[oklch(0.5_0.22_262)] py-28">
      {/* 逆走する2段のアウトライン・マーキー */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track" style={{ animationDuration: "16s" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="statement-jp shrink-0 whitespace-nowrap text-7xl md:text-8xl"
              style={{ WebkitTextStroke: "2px oklch(0.98 0.005 262)", color: "transparent" }}
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
              style={{
                color: i % 3 === 0 ? "oklch(0.84 0.16 85)" : "oklch(0.98 0.005 262)",
              }}
            >
              KEEP RUNNING —
            </span>
          ))}
        </div>
      </div>

      {/* フィルムイエローのステッカー CTA — 回転で違和感を1つ */}
      <div className="mt-16 flex justify-center">
        <Link
          href="/contact"
          className="tape statement-jp -rotate-3 px-10 py-5 text-2xl shadow-xl transition-transform hover:rotate-0 hover:scale-105 focus-visible:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:text-3xl"
        >
          ご相談ください。
        </Link>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-white/85">
        <span className="rec-blink mr-2 inline-block text-[oklch(0.84_0.16_85)]">●</span>
        FREE CONSULTATION — SHOOT / BUILD / RUN
      </p>
    </section>
  );
}

/* ------------------------------- 奥付（コロフォン） ------------------------------- */

function Colophon() {
  const rows = [
    ["CONCEPT", "生きているポスター"],
    ["PHOTO", "KSK WORKS（実写・実案件）"],
    ["TYPE", "Statement JP / Geist Mono"],
    ["MOTION", "APERTURE / SHUTTER SCRUB / FILM ADVANCE / MARQUEE"],
    ["BUILD", "NEXT.JS 16 — CLOUD RUN"],
    ["STATUS", "EXPERIMENTAL — /lab"],
  ];
  return (
    <section className="bg-[oklch(0.16_0.01_75)] px-6 py-24 text-[oklch(0.9_0.005_85)] md:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[oklch(0.6_0.02_85)]">
        COLOPHON — 奥付
      </p>
      <dl className="mt-8 max-w-2xl space-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-6 border-b border-white/10 pb-3">
            <dt className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.6_0.02_85)]">
              {k}
            </dt>
            <dd className="text-sm">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12 flex gap-8 font-mono text-[11px] uppercase tracking-[0.2em]">
        <Link href="/" className="underline underline-offset-8 hover:text-white">
          ← 本編（トップ）へ
        </Link>
        <Link href="/gallery" className="underline underline-offset-8 hover:text-white">
          ギャラリー →
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------- 本体 ---------------------------------- */

export function LabExperience({ photos }: { photos: LabPhoto[] }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="bg-[oklch(0.97_0.01_85)]">
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
