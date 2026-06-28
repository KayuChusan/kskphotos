# 01. プロジェクト全体像ガイド

## このドキュメントの目的

kskphotos プロジェクトの全体像を解説します。何を作るのか、なぜその技術を選んだのか、どう構成されているのかを理解するためのガイドです。

## 構成図（draw.io）

| ファイル | 内容 |
|---------|------|
| [01-system-architecture.drawio](./diagrams/01-system-architecture.drawio) | **システム全体構成図** — Cloud Run / Cloud SQL / Cloud Storage / CDN のデータフロー |
| [02-er-diagram.drawio](./diagrams/02-er-diagram.drawio) | **ER図** — 8モデルのエンティティ関連図 |
| [03-page-sitemap.drawio](./diagrams/03-page-sitemap.drawio) | **ページ遷移図** — 12ルートのサイトマップ |
| [04-gcp-infrastructure.drawio](./diagrams/04-gcp-infrastructure.drawio) | **GCPインフラ構成図** — Cloud Run / Cloud SQL / Storage のネットワーク構成 |

---

## 1. プロジェクトの目的

**kskphotos** は、個人の写真ポートフォリオサイトです。

| 項目 | 内容 |
|------|------|
| サイト種別 | 写真ポートフォリオ + 撮影依頼受付 |
| 差別化機能 | 地図ギャラリー / EXIF ダッシュボード / ビフォーアフター比較 |
| インフラ | GCP (Cloud Run + Cloud SQL + Cloud Storage) |
| IaC | Terraform (google provider) |
| 姉妹サイト | こくみんPedia+（国民民主党ファンサイト、Cloud SQL 共有） |

---

## 2. 技術スタック

### フロントエンド

| 技術 | 役割 |
|------|------|
| **Next.js 16** | Web フレームワーク（SSR/SSG、App Router） |
| **React 19** | UI コンポーネント |
| **TypeScript** | 型安全な JavaScript |
| **Tailwind CSS v4** | ユーティリティファースト CSS |
| **shadcn/ui** | UI コンポーネントライブラリ |
| **Recharts** | EXIF ダッシュボードのグラフ描画 |
| **Mapbox GL JS / Google Maps** | 地図ギャラリー |

### バックエンド・データ

| 技術 | 役割 |
|------|------|
| **PostgreSQL** | データベース (Cloud SQL) |
| **Prisma 7.x** | ORM（型安全なDB操作） |
| **NextAuth.js v5** | 管理者認証 |
| **exifr** | EXIF メタデータ自動抽出 |
| **Zod** | リクエストバリデーション |

### インフラ (GCP)

| 技術 | 役割 | 月額目安 |
|------|------|---------|
| **Cloud Run** | コンテナ実行（スケール to ゼロ） | $0〜5 |
| **Cloud SQL** | PostgreSQL (kokumin-pedia と共有) | $7〜10 (共有) |
| **Cloud Storage** | 写真ストレージ | $0.5〜2 |
| **Cloud CDN** | 画像配信高速化 | $1〜3 |
| **Artifact Registry** | コンテナレジストリ | ~$1 |
| **Terraform** | IaC | 無料 |

### CI/CD

| ファイル | トリガー | 内容 |
|---------|---------|------|
| `.github/workflows/ci.yml` | PR → main | lint → type-check → build |
| `.github/workflows/deploy.yml` | push → main | OIDC認証 → Artifact Registry push → Cloud Run デプロイ |

---

## 3. ディレクトリ構成

```
kskphotos/                     ← プロジェクトルート（git root）
├── .github/workflows/         ← CI/CD パイプライン
├── .claude/skills/            ← Claude Code Skills 定義
├── terraform/                 ← GCP IaC（Terraform モジュール）
├── docs/                      ← このドキュメント群
├── CLAUDE.md                  ← AI（Claude Code）へのプロジェクト指示書
└── app/                       ← Next.js アプリケーション本体
    ├── prisma/
    │   └── schema.prisma      ← DB スキーマ定義（8モデル）
    ├── prisma.config.ts       ← Prisma 7.x 接続設定
    ├── src/
    │   ├── app/               ← ページ（URL と 1:1 対応）
    │   ├── components/        ← UI コンポーネント
    │   │   ├── ui/            ← shadcn/ui
    │   │   ├── gallery/       ← ギャラリー（グリッド/地図/カード）
    │   │   ├── compare/       ← ビフォーアフター
    │   │   ├── dashboard/     ← EXIF チャート (Recharts)
    │   │   ├── booking/       ← 撮影依頼フォーム
    │   │   └── layout/        ← ヘッダー/フッター
    │   ├── generated/         ← Prisma 自動生成（git管理外）
    │   └── lib/               ← ユーティリティ
    │       ├── prisma.ts      ← DB接続
    │       ├── exif.ts        ← EXIF抽出 (exifr)
    │       ├── storage.ts     ← Cloud Storage 操作
    │       ├── queries/       ← DBクエリ層
    │       └── validations/   ← Zod スキーマ
    ├── Dockerfile             ← 本番用コンテナ定義
    ├── docker-compose.yml     ← ローカル DB
    └── package.json
```

---

## 4. ページ構成

| パス | 内容 | データソース |
|------|------|-------------|
| `/` | トップ（ヒーロー写真 + 最新作品） | Photo (isPortfolio) |
| `/gallery` | フォトギャラリー（グリッド / 地図 切替） | Photo (all) |
| `/gallery/[id]` | 写真詳細 + EXIF + 撮影ストーリー | Photo (single) |
| `/gallery/[id]/compare` | ビフォーアフター比較 | Photo (beforeUrl) |
| `/dashboard` | EXIF ダッシュボード | Photo (aggregate) |
| `/services` | 撮影メニュー・料金 | Service |
| `/booking` | 撮影依頼フォーム | Booking (create) |
| `/about` | プロフィール | SiteProfile（/admin/profile で編集） |
| `/blog` | ブログ一覧 | BlogPost |
| `/blog/[slug]` | ブログ記事詳細 | BlogPost (single) |
| `/contact` | お問い合わせ | ContactMessage (create) |
| `/privacy` | プライバシーポリシー | 静的 |

---

## 5. 撮影環境

| 項目 | 内容 |
|------|------|
| カメラ | Sony α7R VI (ILCE-7RM6, 約6100万画素) |
| 撮影形式 | RAW (ARW) |
| 現像 | Adobe Lightroom |
| 書き出し | JPEG（EXIF 完全保持） |
| GPS | カメラ本体非搭載。Creators' App Bluetooth 連携 or 手動付与 |

---

## 進捗状況

| フェーズ | 内容 | ステータス |
|---------|------|----------|
| フェーズ0 | **プロジェクト初期化** — リポジトリ、CLAUDE.md、Skills、ドキュメント | ⏳ 進行中 |
| フェーズ1 | **DB設計** — Prisma スキーマ（8モデル）、シードデータ | 🔲 未着手 |
| フェーズ2 | **UI実装** — 12ページ、ギャラリー、ダッシュボード、ビフォーアフター | 🔲 未着手 |
| フェーズ3 | **バックエンド** — API、EXIF 抽出、Cloud Storage 連携、メール通知 | 🔲 未着手 |
| フェーズ4 | **インフラ** — Terraform (GCP)、CI/CD、デプロイ | 🔲 未着手 |

---

## ドキュメント一覧

- [01. プロジェクト全体像ガイド](./01-project-overview.md)（このドキュメント）
- [02. GCP Terraform ガイド](./02-gcp-terraform.md)
- [03. GitHub Actions CI/CD ガイド](./03-github-actions.md)
- [04. アーキテクチャ全体像ガイド](./04-architecture.md)
- [05. 技術スタックと採用理由](./05-tech-stack-rationale.md)
- [06. ミドルウェアとコンポーネント設計](./06-middleware-and-components.md)
- [07. データモデル(Prisma)ガイド](./07-data-model.md)
- [08. コスト最適化と訴求する強み](./08-cost-and-strengths.md)
- [09. 面接想定 Q&A](./09-interview-qa.md)
- [10. ローカル開発環境セットアップ手順](./10-local-development.md)
- [11. データベース運用ガイド (Prisma)](./11-database-operations.md)
- [12. ギャラリー3本柱 機能ディープダイブ](./12-gallery-features.md)
- [13. 会員解錠（コレクション単位）](./13-member-unlock.md)
- [14. サービス料金・納品ポリシー](./14-service-pricing-policy.md)
- [15. 管理画面：業務委託契約書ジェネレータ](./15-admin-contract-generator.md)
- [16. ビジュアル刷新（FRAME＋二灯化＋図解）](./16-visual-refresh.md)
- [17. 管理画面：保守運用契約書ジェネレータ](./17-admin-maintenance-contract.md)
- [18. 独自ドメインメール（iCloud+ Custom Email Domain）](./18-custom-domain-email.md)
- [ADR（アーキテクチャ意思決定記録）](./adr/README.md)
