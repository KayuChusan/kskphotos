import type { Metadata } from "next";

const SITE_NAME = "KSK Works";

type PageSeoOptions = {
  /** 自己参照する相対パス（例 "/works", "/gallery/abc"）。metadataBase で絶対URL化される */
  path: string;
  /** OG/Twitter 画像（相対 or 絶対）。指定時は og:image を個別画像に上書き。未指定なら既定のブランドOG */
  image?: string | null;
  /** og:type。記事・作品ページは "article" */
  type?: "website" | "article";
  /** 記事の公開日時（ISO8601）。type:"article" 用 */
  publishedTime?: string | null;
};

/**
 * 各ページの canonical / OpenGraph / Twitter を一括付与するヘルパー。
 *
 * - alternates.canonical と openGraph.url を path（相対）で自己参照させ、重複コンテンツ
 *   （Cloud Run 既定ドメイン ⇄ kskworks.jp）の評価分散を防ぐ。
 * - Next.js では子の openGraph / twitter は親 layout の設定を「置換」するため、locale /
 *   siteName / card をここで明示する。og:title / og:description は各ページの title /
 *   description から自動補完されるので、本ヘルパーでは指定しない。
 * - image を渡すと og:image / twitter:image を個別画像に上書きする（写真・記事ページ）。
 *
 * 使い方:
 *   export const metadata = { title, description, ...pageSeo({ path: "/works" }) }
 *   return { title, description, ...pageSeo({ path: `/gallery/${id}`, image, type: "article" }) }
 */
export function pageSeo({
  path,
  image,
  type = "website",
  publishedTime,
}: PageSeoOptions): Metadata {
  const images = image ? [{ url: image }] : undefined;
  return {
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "ja_JP",
      siteName: SITE_NAME,
      url: path,
      ...(images ? { images } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}
