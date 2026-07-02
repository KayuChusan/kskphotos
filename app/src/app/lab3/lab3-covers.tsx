"use client";

/**
 * LAB 03 — 表紙の追求（3案・全画面比較）
 *
 * /lab 表紙への指摘（PC の空白過多／自動折返しで文節が割れる／「写」以外の選択肢）に答える。
 * 改行はすべて句読点で制御:「写したあとが、」/「強い。」
 *
 *  COVER A — 強ロックアップ: 全幅の横組み。写真を抱くのは結論の「強」1字
 *  COVER B — 全文マスク: 文字すべてに写真が流れる2行ロックアップ
 *  COVER C — 半面ブリード: 右半分が実写、ステートメントが写真に衝突する
 */

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

export type LabPhoto = {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const STATEMENT_FONT = { fontFamily: "'Statement JP', sans-serif", fontWeight: 900 } as const;

function photoUrl(p: LabPhoto | undefined) {
  return p ? (p.thumbnailUrl ?? p.imageUrl) : undefined;
}

/** 案ラベル（比較用チップ） */
function CoverLabel({ label, note }: { label: string; note: string }) {
  return (
    <div className="absolute left-5 top-24 z-20 md:left-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="rec-blink mr-2 inline-block text-rec">●</span>
        {label}
      </p>
      <p className="eyebrow-jp mt-1">{note}</p>
    </div>
  );
}

/** 1文字ずつ組まれる横組みステートメント（改行は句読点で制御） */
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

/* ================= COVER A — 強ロックアップ（全幅・句読点折り） ================= */

function CoverA({
  photo,
  reduce,
}: {
  photo: LabPhoto | undefined;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glyphY = useTransform(scrollYProgress, [0, 1], [8, -8]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-background px-5 py-24 md:px-10"
    >
      <CoverLabel label="COVER A — 強 LOCKUP" note="結論の一字が写真を抱く" />

      <h2 className="statement-jp w-full">
        {/* 1行目 — 読点で折る。全幅に張る（PC の空白を殺す） */}
        <KineticLine
          text="写したあとが、"
          reduce={reduce}
          className="text-[clamp(3rem,12.5vw,11.5rem)] leading-[1.05] tracking-[0.01em]"
        />
        {/* 2行目 — 「強」だけ写真マスクの巨大グリフ、「い。」は墨 */}
        <motion.span
          className="mt-2 flex items-end gap-1"
          initial={reduce ? undefined : { opacity: 1, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          <span className="relative inline-block w-[clamp(11rem,34vw,26rem)]">
            <svg viewBox="0 0 100 100" className="block w-full">
              <defs>
                <clipPath id="lab3-a-glyph">
                  <text
                    x="50"
                    y="54"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="94"
                    style={STATEMENT_FONT}
                  >
                    強
                  </text>
                </clipPath>
              </defs>
              {photoUrl(photo) && (
                <motion.g style={reduce ? undefined : { y: glyphY }}>
                  <image
                    href={photoUrl(photo)}
                    x="-12"
                    y="-12"
                    width="124"
                    height="124"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#lab3-a-glyph)"
                  />
                </motion.g>
              )}
              <text
                x="50.9"
                y="54.7"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="94"
                fill="none"
                stroke="var(--brand-blue)"
                strokeWidth="0.4"
                style={STATEMENT_FONT}
              >
                強
              </text>
              <text
                x="50"
                y="54"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="94"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="0.55"
                style={STATEMENT_FONT}
              >
                強
              </text>
            </svg>
            <span className="exif-text absolute bottom-1 left-1 text-muted-foreground">
              F/1.8 · RAW
            </span>
          </span>
          <KineticLine
            text="い。"
            reduce={reduce}
            delay={0.7}
            className="text-[clamp(3rem,17vw,15rem)] leading-none"
          />
          {/* 行末の余白に信号を置く（空白を意味で埋める） */}
          <span className="mb-4 ml-auto hidden text-right md:block">
            <span className="block font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-muted-foreground">
              SHOOT / BUILD
              <br />
              KEEP RUNNING
            </span>
            <span className="tape mt-3 inline-block -rotate-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">
              KSK WORKS — 2026
            </span>
          </span>
        </motion.span>
      </h2>
    </section>
  );
}

/* ================= COVER B — 全文マスク（文字全部に写真が流れる） ================= */

function CoverB({
  photo,
  reduce,
}: {
  photo: LabPhoto | undefined;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [10, -10]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-background"
    >
      <CoverLabel label="COVER B — FULL MASK" note="文のすべてに写真が流れる" />

      <h2 className="w-full px-3 md:px-6" aria-label="写したあとが、強い。">
        <svg viewBox="0 0 100 62" className="block w-full">
          <defs>
            <clipPath id="lab3-b-text">
              <text x="1" y="24" fontSize="27.5" style={STATEMENT_FONT}>
                写したあとが、
              </text>
              <text x="1" y="55" fontSize="27.5" style={STATEMENT_FONT}>
                強い。
              </text>
            </clipPath>
          </defs>
          {photoUrl(photo) && (
            <motion.g style={reduce ? undefined : { y: imgY }}>
              <image
                href={photoUrl(photo)}
                x="-15"
                y="-25"
                width="130"
                height="130"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#lab3-b-text)"
              />
            </motion.g>
          )}
          {/* 見当ズレの複線（青→墨） */}
          <g fill="none" stroke="var(--brand-blue)" strokeWidth="0.28">
            <text x="1.7" y="24.5" fontSize="27.5" style={STATEMENT_FONT}>
              写したあとが、
            </text>
            <text x="1.7" y="55.5" fontSize="27.5" style={STATEMENT_FONT}>
              強い。
            </text>
          </g>
          <g fill="none" stroke="var(--ink)" strokeWidth="0.34">
            <text x="1" y="24" fontSize="27.5" style={STATEMENT_FONT}>
              写したあとが、
            </text>
            <text x="1" y="55" fontSize="27.5" style={STATEMENT_FONT}>
              強い。
            </text>
          </g>
          {/* 2行目の余白（右端）に信号を置く（「。」のリングを避け、幅内に収める） */}
          <g style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
            <circle cx="76" cy="45.4" r="0.8" fill="var(--rec)" />
            <text x="78.2" y="46.3" fontSize="2.2" fill="var(--foreground)" letterSpacing="0.08">
              REC — LAB 03
            </text>
            <text x="78.2" y="50.6" fontSize="2.2" fill="var(--muted-foreground)" letterSpacing="0.08">
              KSKWORKS.JP
            </text>
          </g>
        </svg>
      </h2>
    </section>
  );
}

/* ================= COVER C — 半面ブリード（写真と文字の衝突） ================= */

function CoverC({
  photos,
  reduce,
}: {
  photos: LabPhoto[];
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const main = photos[2] ?? photos[0];

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-background"
    >
      <CoverLabel label="COVER C — HALF BLEED" note="写真の面に、文字が衝突する" />

      {/* 右半分 — 実写の全高ブリード */}
      {photoUrl(main) && (
        <motion.div
          className="absolute inset-y-0 right-0 w-[58%] md:w-[52%]"
          style={reduce ? undefined : { y: photoY, scale: 1.08 }}
        >
          <Image
            src={photoUrl(main)!}
            alt=""
            fill
            className="object-cover"
            sizes="55vw"
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

      {/* ステートメント — 写真へ食い込む（生成りの縁取りで両面の可読を担保） */}
      <h2
        className="statement-jp relative z-10 w-full px-5 md:px-10"
        style={{
          WebkitTextStroke: "0",
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
      </h2>

      {/* 左下 — 誌面情報（空白に意味を） */}
      <div className="absolute bottom-10 left-5 z-10 font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-muted-foreground md:left-10">
        <p>
          <span className="rec-blink mr-2 inline-block text-rec">●</span>
          SHOOT / BUILD / KEEP RUNNING
        </p>
        <p>KSKWORKS.JP — 2026</p>
      </div>
      <span className="tape absolute bottom-10 right-6 z-10 rotate-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] md:right-10">
        NO EMPTY SPACE
      </span>
    </section>
  );
}

/* ================================ 本体 ================================ */

export function Lab3Covers({ photos }: { photos: LabPhoto[] }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="bg-background">
      <CoverA photo={photos[0]} reduce={reduce} />
      <CoverB photo={photos[1] ?? photos[0]} reduce={reduce} />
      <CoverC photos={photos} reduce={reduce} />

      {/* 比較メモ＋導線 */}
      <section data-header-dark className="bluehour px-5 py-20 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          NOTES
        </p>
        <dl className="mt-6 max-w-2xl space-y-3">
          {[
            ["A — 強 LOCKUP", "全幅ロックアップで PC の空白を殺す。写真を抱くのは結論の「強」。改行は「写したあとが、」/「強い。」の句読点折り"],
            ["B — FULL MASK", "文のすべてが写真の窓になる最大火力。誌面情報は 2行目の余白に埋める"],
            ["C — HALF BLEED", "右半分が実写の全高ブリード。文字が写真に食い込む（生成りの縁取りで可読担保）"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 border-b pb-3 md:flex-row md:items-baseline md:gap-6">
              <dt className="w-40 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {k}
              </dt>
              <dd className="text-sm leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs tracking-[0.14em]">
          <Link href="/lab" className="inline-flex min-h-11 items-center underline underline-offset-8 hover:text-foreground">
            ← /lab（基準）
          </Link>
          <Link href="/lab2" className="inline-flex min-h-11 items-center underline underline-offset-8 hover:text-foreground">
            /lab2（本編品質版）
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-8 hover:text-foreground">
            本編（トップ）へ
          </Link>
        </div>
      </section>
    </div>
  );
}
