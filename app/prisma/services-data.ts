import type { PrismaClient } from "../src/generated/prisma/client";

// 公開の料金メニュー（本番にも投入する実データ）。
// 撮影は「時間制1本」。/services の撮影料金表はコード側（services/page.tsx）で
// 表示し、ここの Service は (1) 予約フォーム /booking の選択肢、(2) Web/IT メニュー
// の表示、に使う。撮影系（出張撮影・政治・商用）は price を 0 とし、料金は時間制表で示す。
export const SERVICES = [
  { id: "seed-svc-photo", title: "出張撮影（時間制）", description: "ポートレート・ファミリー・イベントなど。用途を問わず時間制で承ります。", price: 0, priceNote: "時間制 1時間 ¥11,000〜", duration: "時間制", category: "PORTRAIT" as const, isPopular: false, features: ["1時間 ¥11,000（30分延長ごとに +¥5,000）", "撮影時間に応じたセレクト納品（1時間あたり約20枚）", "うちレタッチ仕上げは撮影1時間につき10枚込み", "レタッチ追加 1枚 ¥1,000（10枚パック ¥8,000）", "出張費は別途実費"], sortOrder: 1 },
  { id: "seed-svc-politics", title: "政治・選挙撮影", description: "議員・候補者のプロフィール、選挙ポスター、街宣・集会の記録。", price: 0, priceNote: "時間制 / 要相談", duration: "プロフィール・ポスター・記録", category: "POLITICS" as const, isPopular: false, features: ["プロフィール・公式サイト・SNS 用", "選挙ポスター・リーフレット用撮影", "街宣・集会・パーティーの記録", "印刷入稿用データ調整に対応", "継続契約・撮影同行もご相談"], sortOrder: 2 },
  { id: "seed-svc-commercial", title: "商用・法人", description: "企業・店舗・商品の商用撮影。", price: 0, priceNote: "要相談", duration: "内容に応じて", category: "COMMERCIAL" as const, isPopular: false, features: ["商用利用 OK", "企業・店舗・商品撮影", "撮影は時間制（最低2時間〜）", "スタジオ撮影対応可", "ディレクション対応", "納期相談可"], sortOrder: 3 },
  { id: "seed-svc-web", title: "サイト制作", description: "構成からデザイン・実装・公開まで一括対応。", price: 88000, priceNote: "〜", duration: "LP・ポートフォリオ・予約サイト", category: "WEB_PRODUCTION" as const, isPopular: false, features: ["構成・デザイン・実装・公開まで一括", "スマホ対応・高速表示", "独自ドメイン・SSL 設定込み", "予約フォーム・ギャラリー組み込み対応", "公開後の更新方法もレクチャー", "運用へ移行する場合、最初の3ヶ月は運用サポート無償（軽微な更新・修正を月2回まで）"], sortOrder: 4 },
  { id: "seed-svc-web-renew", title: "サイトのリニューアル・引き継ぎ", description: "既存サイトのリニューアルや、他社・自作サイトの運用引き継ぎにも対応。", price: 0, priceNote: "要相談", duration: "現状確認のうえお見積り", category: "WEB_PRODUCTION" as const, isPopular: false, features: ["既存サイトのデザイン刷新・改修", "他社・自作サイトの運用引き継ぎ", "表示速度・スマホ対応・SEO の改善", "ドメイン・サーバーの移管サポート", "撮影とセットで素材から一新も可"], sortOrder: 5 },
  { id: "seed-svc-maint", title: "保守・運用サポート", description: "サイトの更新・管理・障害一次対応。", price: 11000, priceNote: "〜", duration: "月額・継続契約", category: "IT_SUPPORT" as const, isPopular: false, features: ["当社制作サイトは制作から運用移行で最初の3ヶ月無償（軽微な更新・修正を月2回まで／新規ページ追加・デザイン刷新・機能追加は別途）", "サイトの更新作業・軽微な修正", "ドメイン・サーバー・SSL の管理", "障害時の一次対応", "アクセス状況の簡易レポート", "メール・ツールの困りごと相談"], sortOrder: 6 },
  { id: "seed-svc-it", title: "政治・選挙の IT サポート", description: "公式サイト・運用保守・SNS 運用の支援。", price: 0, priceNote: "要相談", duration: "サイト・SNS 環境", category: "IT_SUPPORT" as const, isPopular: false, features: ["公式サイト・後援会サイトの構築", "公開後のサイト運用・保守の継続サポート", "SNS 運用環境の整備・素材供給", "撮影とセットでの一括支援が可能", "事務所スタッフ向けレクチャー対応"], sortOrder: 7 },
];

// 時間制1本化に伴い廃止した旧・撮影メニュー（個別ジャンル）。
// createOnly でも確実に消えるよう、seedServices 内で isActive=false にする。
export const RETIRED_SERVICE_IDS = [
  "seed-svc-portrait",
  "seed-svc-family",
  "seed-svc-event",
  "seed-svc-pol-profile",
  "seed-svc-pol-poster",
  "seed-svc-pol-event",
];

/**
 * Service を投入する。
 * - 既定(createOnly)は「無ければ作成、有れば触らない」= admin の編集を上書きしない（本番向け）。
 * - overwrite=true で既存も初期内容に揃える（ローカル/デモ向け）。
 * - いずれの場合も、廃止した旧・撮影メニュー(RETIRED_SERVICE_IDS)は非公開化する。
 */
export async function seedServices(
  prisma: PrismaClient,
  { overwrite = false }: { overwrite?: boolean } = {}
) {
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: overwrite ? { ...s, isActive: true } : {},
      create: { ...s, isActive: true },
    });
  }
  // 旧・撮影メニュー（時間制統合により廃止）を非公開化（存在すれば）
  await prisma.service.updateMany({
    where: { id: { in: RETIRED_SERVICE_IDS } },
    data: { isActive: false },
  });
}
