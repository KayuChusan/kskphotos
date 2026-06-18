import type { PrismaClient } from "../src/generated/prisma/client";

// 公開の料金メニュー（本番にも投入する実データ）。
export const SERVICES = [
  { id: "seed-svc-pol-profile", title: "プロフィール撮影", description: "議員・候補者の公式サイト・SNS・広報物用ポートレート。", price: 22000, priceNote: "〜", duration: "60分 / 税込", category: "POLITICS" as const, isPopular: false, features: ["公式サイト・SNS・広報物用", "屋内外ロケーション対応", "セレクト10枚レタッチ納品", "使用権込み・クレジット不要", "1週間以内に納品"], sortOrder: 1 },
  { id: "seed-svc-pol-poster", title: "ポスター用撮影一式", description: "選挙ポスター・リーフレット用の撮影一式。", price: 38500, priceNote: "〜", duration: "120分 / 税込", category: "POLITICS" as const, isPopular: false, features: ["選挙ポスター・リーフレット用", "衣装・表情パターン複数撮影", "印刷入稿に耐える高解像度データ", "デザイナー入稿用の調整対応", "プロフィール用カットも同時納品"], sortOrder: 2 },
  { id: "seed-svc-pol-event", title: "街宣・イベント記録", description: "街頭演説・集会・パーティーの記録撮影。", price: 33000, priceNote: "〜", duration: "半日 / 税込", category: "POLITICS" as const, isPopular: false, features: ["街頭演説・集会・パーティー", "SNS 即時投稿用の速報納品対応", "100カット以上撮影", "セレクト30枚レタッチ納品", "1日対応・継続契約はご相談"], sortOrder: 3 },
  { id: "seed-svc-portrait", title: "ポートレート", description: "個人向けのポートレート出張撮影。", price: 11000, priceNote: null, duration: "60分 / 税込", category: "PORTRAIT" as const, isPopular: false, features: ["ロケーション1箇所", "30カット以上撮影", "セレクト10枚レタッチ納品", "撮影データ全カット納品", "2週間以内に納品"], sortOrder: 4 },
  { id: "seed-svc-family", title: "ファミリー / カップル", description: "家族・カップルの出張撮影。記念日や七五三にも。", price: 16500, priceNote: null, duration: "90分 / 税込", category: "FAMILY" as const, isPopular: true, features: ["ロケーション2箇所まで", "50カット以上撮影", "セレクト20枚レタッチ納品", "撮影データ全カット納品", "家族・カップル向け", "2週間以内に納品"], sortOrder: 5 },
  { id: "seed-svc-event", title: "イベント", description: "イベント全体をカバーする記録撮影。", price: 33000, priceNote: "〜", duration: "3時間〜 / 税込", category: "EVENT" as const, isPopular: false, features: ["イベント全体をカバー", "100カット以上撮影", "セレクト50枚レタッチ納品", "撮影データ全カット納品", "長時間対応可（追加料金あり）", "3週間以内に納品"], sortOrder: 6 },
  { id: "seed-svc-commercial", title: "商用・法人", description: "企業・店舗・商品の商用撮影。", price: 0, priceNote: "要相談", duration: "内容に応じて", category: "COMMERCIAL" as const, isPopular: false, features: ["商用利用権込み", "企業・店舗・商品撮影", "カット数・レタッチ数は相談", "スタジオ撮影対応可", "ディレクション対応", "納期相談可"], sortOrder: 7 },
  { id: "seed-svc-web", title: "サイト制作", description: "構成からデザイン・実装・公開まで一括対応。", price: 88000, priceNote: "〜", duration: "LP・ポートフォリオ・予約サイト", category: "WEB_PRODUCTION" as const, isPopular: false, features: ["構成・デザイン・実装・公開まで一括", "スマホ対応・高速表示", "独自ドメイン・SSL 設定込み", "予約フォーム・ギャラリー組み込み対応", "公開後の更新方法もレクチャー"], sortOrder: 8 },
  { id: "seed-svc-it", title: "政治・選挙の IT サポート", description: "公式サイト・ライブ配信・SNS 運用の支援。", price: 0, priceNote: "要相談", duration: "サイト・配信・SNS 環境", category: "IT_SUPPORT" as const, isPopular: false, features: ["公式サイト・後援会サイトの構築", "街宣・集会のライブ配信環境づくり", "SNS 運用環境の整備・素材供給", "撮影とセットでの一括支援が可能", "事務所スタッフ向けレクチャー対応"], sortOrder: 9 },
  { id: "seed-svc-maint", title: "保守・運用サポート", description: "サイトの更新・管理・障害一次対応。", price: 11000, priceNote: "〜", duration: "月額・継続契約", category: "IT_SUPPORT" as const, isPopular: false, features: ["サイトの更新作業・軽微な修正", "ドメイン・サーバー・SSL の管理", "障害時の一次対応", "アクセス状況の簡易レポート", "メール・ツールの困りごと相談"], sortOrder: 10 },
];

/**
 * Service を投入する。
 * - 既定(createOnly)は「無ければ作成、有れば触らない」= admin の編集を上書きしない（本番向け）。
 * - overwrite=true で既存も初期内容に揃える（ローカル/デモ向け）。
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
}
