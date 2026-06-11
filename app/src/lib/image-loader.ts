"use client";

/**
 * next/image カスタムローダー。
 * アップロード画像はすべてアップロード時に WebP バリアントを事前生成済みのため、
 * 実行時の画像最適化（sharp による変換）を行わず、最適な事前生成ファイルへ
 * URL を書き換えるだけにする。Cloud Run の CPU 消費とレイテンシをゼロにする。
 *
 * 幅は src/lib/images.ts の VARIANT_WIDTHS と一致させること。
 */
const VARIANT_WIDTHS = [400, 800, 1600, 2560];

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // 事前生成パイプラインを通っていない画像はそのまま返す
  if (!src.startsWith("/uploads/")) return src;

  const match = src.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
  if (!match) return src;

  // 既に -w800 等のバリアント URL が渡された場合もベース名に正規化
  const base = match[1].replace(/-w\d+$/, "");
  const variant =
    VARIANT_WIDTHS.find((v) => v >= width) ??
    VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];

  return `${base}-w${variant}.webp`;
}
