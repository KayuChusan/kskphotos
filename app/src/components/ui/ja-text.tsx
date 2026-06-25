import { cloneElement, Fragment, isValidElement, type ReactNode } from "react";
import { loadDefaultJapaneseParser } from "budoux";
import { cn } from "@/lib/utils";

// BudouX の日本語パーサはモジュール単位で1回だけ生成（サーバー側で実行）。
const parser = loadDefaultJapaneseParser();

// 中黒・読点・括弧閉じなど「直後で折れて自然」な区切り。
// BudouX が長い中黒区切りの並び（例: LP・ポートフォリオ・予約サイト…）を1文節に
// まとめてしまうケースに備え、これらの直後にも改行機会(<wbr>)を補う。
const DELIMITERS = /(?<=[・、，。）」』／/])/;

// 文字列を文節＋区切りで分割し、境界に <wbr> を挟んだノードへ変換。
function breakString(text: string, keyPrefix: string): ReactNode {
  const parts = parser
    .parse(text)
    .flatMap((seg) => seg.split(DELIMITERS).filter(Boolean));
  return parts.map((part, i) => (
    <Fragment key={`${keyPrefix}-${i}`}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}

// 子ノードを再帰的にたどり、文字列だけ <wbr> 挿入。要素（<strong> 等）は中身を処理して維持。
function process(node: ReactNode, keyPrefix: string): ReactNode {
  if (typeof node === "string") return breakString(node, keyPrefix);
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={`${keyPrefix}-${i}`}>{process(child, `${keyPrefix}-${i}`)}</Fragment>
    ));
  }
  if (isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: ReactNode }>;
    if (el.props?.children != null) {
      return cloneElement(el, {
        children: process(el.props.children, `${keyPrefix}-c`),
      });
    }
  }
  return node;
}

/**
 * 日本語の「文節の途中での改行」を防ぐためのテキストラッパー。
 *
 * BudouX で文節に分割し、境界（＋中黒・読点など）に <wbr>（改行可能位置）を挿入したうえで
 * `break-keep`（word-break: keep-all）を当てる。これにより、ブラウザは文節境界でのみ改行し、
 * カタカナ語や複合語が途中で割れない。iOS Safari を含む全ブラウザで効く
 * （CSS の auto-phrase は Chromium 限定のため）。
 *
 * 子には文字列だけでなく `<strong>`・`<Link>` 等を含む ReactNode も渡せる
 * （文字列ノードだけ処理し、要素は中身を再帰処理して構造を保つ）。
 * 日本語の本文・ラベル・説明文で、狭い幅で折り返す箇所に使う。
 */
export function JaText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("break-keep", className)}>{process(children, "ja")}</span>
  );
}
