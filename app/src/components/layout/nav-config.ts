import { BLOG_ENABLED } from "@/lib/feature-flags";

export interface NavItem {
  /** 日本語の主ラベル(来訪者が読む) */
  title: string;
  /** 英語の装飾サブラベル(デザイン上のアクセント) */
  en: string;
  href: string;
}

// 来訪者の動線順: 見る → 実績 → 料金 → 案内 → 知る（ブログは BLOG_ENABLED が false の間は非表示）
export const mainNav: NavItem[] = [
  { title: "ギャラリー", en: "Gallery", href: "/gallery" },
  { title: "実績", en: "Works", href: "/works" },
  { title: "料金", en: "Price", href: "/services" },
  ...(BLOG_ENABLED
    ? [{ title: "ブログ", en: "Journal", href: "/blog" }]
    : []),
  { title: "ご利用案内", en: "Guide", href: "/guide" },
  { title: "プロフィール", en: "About", href: "/about" },
];

export const secondaryNav: NavItem[] = [
  { title: "ご依頼", en: "Booking", href: "/booking" },
  { title: "お問い合わせ", en: "Contact", href: "/contact" },
];
