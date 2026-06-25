import { Fragment } from "react";
import { loadDefaultJapaneseParser } from "budoux";
import { cn } from "@/lib/utils";

// BudouX の日本語パーサはモジュール単位で1回だけ生成（サーバー側で実行）。
const parser = loadDefaultJapaneseParser();

/**
 * 日本語の「文節の途中での改行」を防ぐためのテキストラッパー。
 *
 * BudouX で文節に分割し、境界に <wbr>（改行可能位置）を挿入したうえで
 * `break-keep`（word-break: keep-all）を当てる。これにより、ブラウザは
 * 文節境界でのみ改行し、カタカナ語や複合語が途中で割れない。
 * iOS Safari を含む全ブラウザで効く（CSS の auto-phrase は Chromium 限定のため）。
 *
 * 使い方: 文字列を子に渡すだけ。`<p><JaText>{text}</JaText></p>`
 * 日本語の本文・ラベルで、狭い幅で折り返す箇所に使う。
 */
// 中黒・読点・括弧閉じなど「直後で折れて自然」な区切り。
// BudouX が長い中黒区切りの並び（例: LP・ポートフォリオ・予約サイト…）を1文節に
// まとめてしまうケースに備え、これらの直後にも改行機会(<wbr>)を補う。
const DELIMITERS = /(?<=[・、，。）」』])/;

export function JaText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  // BudouX の文節境界 ＋ 区切り記号の直後、両方を改行可能位置にする。
  const parts = parser
    .parse(children)
    .flatMap((seg) => seg.split(DELIMITERS).filter(Boolean));
  return (
    <span className={cn("break-keep", className)}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
    </span>
  );
}
