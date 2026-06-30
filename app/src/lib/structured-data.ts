// JSON-LD 構造化データのビルダー集約。
// 依存を増やさないため schema-dts は使わず、プレーンオブジェクト（後で JSON.stringify）で組む。
// ノードは安定した @id（ORG_ID / SITE_ID）で相互参照させる。

export type JsonLdNode = Record<string, unknown>;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kskworks.jp";

export const ORG_ID = `${siteUrl}/#org`;
export const SITE_ID = `${siteUrl}/#website`;

const description =
  "KSK Works — 出張撮影・ポートレート。家族写真・七五三からプロフィール・イベント撮影、政治・選挙写真まで、神奈川を拠点に全国で承ります。";

/** サイト全体の @graph: ProfessionalService(地域ビジネス系) と WebSite を @id で連結。 */
export function siteGraph(): JsonLdNode[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": ORG_ID,
      name: "KSK Works",
      description,
      url: siteUrl,
      image: `${siteUrl}/opengraph-image`,
      logo: `${siteUrl}/ksk-works-logo-dark.png`,
      email: "info@kskworks.jp",
      priceRange: "¥¥",
      address: {
        "@type": "PostalAddress",
        addressRegion: "神奈川県",
        addressCountry: "JP",
      },
      areaServed: { "@type": "Country", name: "日本" },
      serviceType: [
        "出張撮影",
        "ポートレート撮影",
        "イベント撮影",
        "Web制作・IT サポート",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE_ID,
      url: siteUrl,
      name: "KSK Works",
      inLanguage: "ja-JP",
      publisher: { "@id": ORG_ID },
    },
  ];
}

/** /about のフォトグラファー Person ノード。worksFor で組織に連結。 */
export function personSchema(opts: {
  name: string;
  jobTitle?: string;
  image?: string | null;
  knowsAbout?: string[];
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    jobTitle: opts.jobTitle ?? "フォトグラファー",
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.knowsAbout ? { knowsAbout: opts.knowsAbout } : {}),
    worksFor: { "@id": ORG_ID },
    url: `${siteUrl}/about`,
  };
}

/** パンくず。items は [{name, path}]。最後の要素が現在ページ。 */
export function breadcrumbSchema(
  items: { name: string; path: string }[]
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`,
    })),
  };
}

/** /services の Service ノード（最低価格 Offer 付き）。provider は組織に連結。 */
export function serviceSchema(opts: {
  name: string;
  price: number;
  offerDescription: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "日本" },
    offers: {
      "@type": "Offer",
      priceCurrency: "JPY",
      price: opts.price,
      description: opts.offerDescription,
    },
  };
}
