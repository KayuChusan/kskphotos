# kskphotos

> 撮影した写真を見せ、撮影依頼を受け、そして「作れること」を証明する。
> 写真ポートフォリオ ＋ 撮影依頼の商用サイト ＋ 技術ショーケースを 1 つに重ねた個人開発プロジェクトです。

このリポジトリは、単なる作品集ではありません。**Next.js によるフルスタック実装**と、**GCP 上のクラウド運用（IaC / CI-CD）**の両方を、実際に動くプロダクトとして示すことを目的にしています。読み手として想定しているのは「これから採用を検討する方」と「これから同じ構成を学ぶ方」の両方です。

---

## 技術ハイライト

「専門用語は初出時に一言かみ砕く」方針で、役割を併記しています。

| 領域 | 採用技術 | 役割（ひとことで） |
|------|---------|------------------|
| フレームワーク | **Next.js 16**（App Router / RSC） | サーバー側でページを組み立てる Web フレームワーク |
| UI ライブラリ | **React 19** | 画面部品の構築 |
| 言語 | **TypeScript**（strict） | 型でバグを未然に防ぐ JavaScript |
| ORM | **Prisma 7** + `@prisma/adapter-pg`（PrismaPg） | SQL を直接書かず型安全に DB 操作する道具 |
| データベース | **PostgreSQL**（Cloud SQL） | 写真の情報・EXIF・予約などを保存 |
| スタイル | **Tailwind CSS v4** + **shadcn/ui** + `@base-ui/react` | ユーティリティ CSS と UI コンポーネント |
| グラフ | **Recharts** | EXIF ダッシュボードの可視化 |
| 地図 | **MapLibre GL JS** | 撮影場所を地図に展開（オープンソースの地図描画ライブラリ） |
| 画像処理 | **Sharp** / **exifr** | WebP 事前生成 / EXIF（撮影情報）抽出 |
| 認証 | **NextAuth v5** | 管理画面のログイン |
| バリデーション | **Zod** | 入力値の検証（スキーマ定義） |
| 演出 | **framer-motion** / **next-view-transitions** | アニメーション・画面遷移 |
| インフラ実行環境 | **GCP Cloud Run**（スケール to ゼロ） | アクセスがある時だけ起動するコンテナ実行環境 |
| IaC | **Terraform** | インフラをコードで定義・再現する道具 |
| CI/CD | **GitHub Actions**（Workload Identity Federation / OIDC） | 鍵を持たずに GCP へ自動デプロイ |

> バージョンはすべて `app/package.json` と一致しています（Next.js `16.2.9` / React `19.2.4` / Prisma `^7.8.0` / Zod `^4.4.3` ほか）。

---

## デモ・スクリーンショット

**本番サイト**: https://kskphotos-jfiomxgszq-an.a.run.app  （GCP Cloud Run / `asia-northeast1`）

| トップ（ヒーロー） | ギャラリー |
|:---:|:---:|
| [![トップ](./docs/screenshots/home.png)](https://kskphotos-jfiomxgszq-an.a.run.app) | [![ギャラリー](./docs/screenshots/gallery.png)](https://kskphotos-jfiomxgszq-an.a.run.app/gallery) |
| **EXIF ダッシュボード** | **撮影実績 (Works)** |
| [![EXIFダッシュボード](./docs/screenshots/dashboard.png)](https://kskphotos-jfiomxgszq-an.a.run.app/dashboard) | [![実績](./docs/screenshots/works.png)](https://kskphotos-jfiomxgszq-an.a.run.app/works) |

> デプロイ先は GCP Cloud Run（リージョン: `asia-northeast1`）です。Cloud Run は「スケール to ゼロ」（アクセスがない間は台数 0 = 課金 0）で運用しているため、初回アクセス時のみ起動待ち（コールドスタート）が発生します。スクリーンショットは現在の本番サイトのものです（ビフォーアフター比較は各写真の詳細ページ `/gallery/[id]/compare` で確認できます）。

---

## 3 本柱（差別化機能）

他のフォトグラファーサイトには無い 3 機能を、サイト自体の見どころ兼・技術デモとして実装しています。いずれも「サーバー側（RSC）で Prisma が Cloud SQL からデータを取り、HTML を組み立てて返す。地図やグラフのように操作が必要な部分だけブラウザ側で動く」という共通フローに乗っています。

### 1. 地図ギャラリー

撮影した写真を、**撮影場所**ベースで地図上に展開します。アップロード時に `app/src/lib/exif.ts` が `exifr` で EXIF の GPS 座標（緯度・経度）を抽出して DB に保存し、`app/src/components/gallery/photo-map.tsx`（MapLibre GL JS）が、座標を持つ写真だけを地図上にピン表示します。「あの場所の写真を見たい」という導線を作る機能です。

> 地図は MapLibre GL JS が OpenStreetMap タイルを使う自前のスタイル定義（`photo-map.tsx` 内の `MAP_STYLE`）で描画するため、Mapbox のアクセストークンは不要です（`.env.example` の `NEXT_PUBLIC_MAPBOX_TOKEN` は現状コードからは参照しておらず、将来の差し替え用に残しているだけです）。

### 2. EXIF ダッシュボード

DB に貯めた EXIF を集計し、`app/src/components/dashboard/exif-charts.tsx`（Recharts）でグラフ化します。集計はサーバー側で取得したデータをもとに描画します。実装しているのは次の指標です。

- **レンズ使用率**（横棒グラフ：撮影枚数の多いレンズ順）
- **カテゴリー比率**（円グラフ：被写体ジャンルごとの割合）
- **焦点距離 × 絞り**（散布図：1 枚ごとの撮影設定の分布）
- **ISO 感度の分布**（棒グラフ：感度帯ごとの撮影枚数）
- サマリー指標として **総撮影枚数 / 使用レンズ数 / 撮影場所数**

撮影傾向がひと目で伝わる、データドリブンな見せ方です。

### 3. ビフォーアフター

RAW から現像した「仕上がり（After）」と「素（Before）」の 2 枚を、スライダーで重ねて比較できます（`app/src/components/gallery/compare-slider.tsx`）。現像（レタッチ）の価値を直感的に伝える機能で、Before/After 画像はアップロード経由で Cloud Storage に保管します（`Photo.beforeUrl` が設定された写真で `/gallery/[id]/compare` ページが有効になります）。

---

## システム構成

ブラウザからのリクエストが、どの GCP 部品を、どの順番で通るかを示します。HTML（Cloud Run が生成）と画像（Cloud Storage から配信）は **別経路** で取得される点がポイントです。

```mermaid
flowchart TD
    user["閲覧者のブラウザ"]
    gh["GitHub Actions<br/>(CI / CD)"]

    subgraph gcp["GCP (Google Cloud)"]
        run["Cloud Run<br/>Next.js コンテナ (port 8080)<br/>スケール to ゼロ"]
        gcs["Cloud Storage<br/>写真原本・WebP・before 画像"]
        sql["Cloud SQL (PostgreSQL)<br/>kokumin-pedia 側 Terraform が所有・共有"]
        ar["Artifact Registry<br/>コンテナイメージ"]
        sm["Secret Manager<br/>DATABASE_URL 等"]
    end

    user -->|"ページHTML要求"| run
    user -->|"画像要求 (/uploads)"| gcs

    run -->|"Prisma 経由のSQL"| sql
    run -.->|"起動時に読込"| sm
    run -->|"アップロード保存"| gcs

    gh -.->|"OIDC 認証 (WIF・鍵レス)"| run
    gh -->|"イメージ push"| ar
    ar -->|"デプロイ"| run
    gh -.->|"ビルド時に Auth Proxy 経由で参照"| sql
```

| 部品 | 役割 | ポイント |
|------|------|---------|
| **Cloud Run** | Next.js コンテナの実行環境 | リクエスト時だけ起動。来ない間はゼロ台（料金ゼロ）。コンテナは port 8080 で待ち受け |
| **Cloud SQL** | PostgreSQL データベース | 姉妹サイト [kokumin-pedia](../kokumin-pedia/) と共有。**DB 本体は kokumin-pedia 側の Terraform が所有**し、kskphotos は接続するのみ |
| **Cloud Storage** | 写真ファイルの保管庫（バケット `kskphotos-photos`） | 原本・閲覧用 WebP・before 画像を保管。アップロードの永続化先 |
| **Artifact Registry** | コンテナレジストリ | ビルド済みイメージを保管し Cloud Run へ配る |
| **Secret Manager** | 接続情報の金庫 | `DATABASE_URL`（シークレット ID `kskphotos-database-url`）等を安全に保管し起動時に注入 |

> **正直な但し書き（誇張しないために）**
> - **Cloud CDN は現時点で「保留」段階**です。コスト見積との兼ね合いで意図的に未適用で、常時稼働の CDN はまだありません。CDN を経由しない間は、`app/src/app/uploads/[...path]/route.ts` が Cloud Storage の公開 URL（`https://storage.googleapis.com/<bucket>/uploads/...`）へリダイレクトして画像を配信します。
> - **Cloud Run のファイルシステムは揮発的**（リクエストごとに作り直され得る）です。そのためアップロードの永続化は Cloud Storage 前提で、ローカル保存（`public/uploads`）はあくまで開発用フォールバックで非永続です。`GCS_BUCKET_NAME` が設定されていれば GCS へ、なければローカル FS へ保存します（`app/src/lib/storage.ts`）。
> - クロスリージョン DR・マルチ AZ・Redis 等は kskphotos には **ありません**。シンプルさと低コストを優先した構成です。

---

## 画像配信の工夫（実行時変換ゼロ）

画像最適化を「実行時」ではなく「アップロード時」に寄せています。

1. アップロード時に `app/src/lib/images.ts` の Sharp が、EXIF の向き（Orientation）を物理回転に反映したうえで、WebP の複数幅（`VARIANT_WIDTHS = [400, 800, 1600, 2560]`）と blur プレースホルダーを **事前生成** します（フルサイズは JPEG として別途生成）。
2. 表示時は `next/image` のカスタムローダー `app/src/lib/image-loader.ts` が、要求された表示幅に合う事前生成 WebP（例: `...-w800.webp`）へ URL を書き換えます（`next.config.ts` で `images.loader: "custom"` を指定）。
3. これにより **実行時の画像変換を一切行わず**、Cloud Run の CPU 消費とレイテンシを抑えます。

保存先は `app/src/lib/storage.ts` が環境変数 `GCS_BUCKET_NAME` の有無で切り替えます（本番 = Cloud Storage、開発 = ローカル）。

---

## レンダリング戦略

| 戦略 | 何をするか | 例 |
|------|-----------|-----|
| **RSC**（React Server Components） | サーバー側でデータ取得＋HTML 生成 | 公開ページ全般 |
| **ISR**（`export const revalidate = 3600`） | HTML を最大 1 時間キャッシュ→裏で再生成 | `/`, `/gallery`, `/dashboard`, `/collections` など |
| **オンデマンド再検証**（`revalidatePath`） | 更新時に該当ページを即作り直し | 管理画面（`app/src/app/admin/...`）からの写真・コレクション更新時 |
| **`generateStaticParams`** | ビルド時に DB を見て可変 URL を先回り生成 | `/collections/[slug]`, `/gallery/[id]`, `/gallery/[id]/compare` |

> `generateStaticParams` がビルド時に DB を参照するため、**ビルド工程にも DB 接続が必要**です。これが後述の CI（Postgres サービス）/ CD（Cloud SQL Auth Proxy）の設計理由になっています。

---

## このプロジェクトが示すスキル（両面）

このポートフォリオの狙いは「実装もできる」「クラウド運用もできる」を 1 つのプロダクトで両立して見せることです。

### フルスタック実装力

- **Next.js 16 App Router + RSC** によるサーバー主導のレンダリング設計（RSC / ISR / オンデマンド再検証 / `generateStaticParams` の使い分け）。
- **TypeScript strict + Prisma 7 + Zod** による、入力からデータ層まで一貫した型安全（Prisma は `prisma-client` ジェネレータで `app/src/generated/prisma` に出力し、`PrismaPg` アダプタ経由で接続）。
- **NextAuth v5** + `app/src/middleware.ts`（matcher `"/admin/:path*"`）による `/admin` のアクセス制御（認証設定は `app/src/lib/auth.ts` / `auth.config.ts`、サインインは `/auth/signin`、本番のメイン Provider は Google）。
- **MapLibre / Recharts / 比較スライダー**といった、用途の異なる UI を要件に合わせて実装。
- **Sharp による WebP 事前生成 ＋ カスタムローダー**で、実行時変換ゼロの画像配信を自前設計。
- **テスト**: Vitest を導入。EXIF 抽出ロジック（`app/src/lib/exif.ts`）には `app/src/lib/exif.test.ts` で **44 ケース**（パラメータ化テスト `it.each` 展開を含む）を用意し、`npm run test:run` で 44 件すべてパスを確認済み。

### GCP / IaC / CI-CD のクラウド力

- **Terraform でインフラをコード化**。`terraform/modules/` に `cloud-run` / `iam` / `artifact-registry` / `storage` の 4 モジュールを実装。
- **Workload Identity Federation（OIDC）**による鍵レスデプロイ。サービスアカウント鍵を GitHub に置かず、GitHub の身元を GCP が直接信頼する方式（`terraform/modules/iam` で Workload Identity Pool / Provider を定義）。
- **Cloud Run のスケール to ゼロ**で個人サイトの運用コストを最小化。
- **CI/CD の設計をビルド要件に合わせて作り込み**: ビルド時 DB 接続が必須なため、CI では Postgres サービスを、CD では Cloud SQL Auth Proxy を立てて対応（下記）。

---

## CI / CD

| ワークフロー | トリガー | 内容 |
|-------------|---------|------|
| `.github/workflows/ci.yml` | Pull Request → `main` | Postgres サービス起動 → `prisma generate` → `prisma db push` → `lint` → `tsc --noEmit`（型チェック）→ `test:run`（Vitest）→ `build` |
| `.github/workflows/deploy.yml` | push → `main` | WIF（OIDC）認証 → GCS から写真同期（`gs://kskphotos-photos/uploads`）→ **Cloud SQL Auth Proxy** 起動 → `docker build`（`--build-arg DATABASE_URL`）→ Artifact Registry へ push → Cloud Run（`asia-northeast1`）へデプロイ |

> CI が PR ごとに lint・型・テスト・ビルドまで通すこと、CD がビルド時 DB 接続まで含めて完全自動であることが、「動くものを安全に出し続けられる」ことの裏付けです。

---

## ローカル起動手順

前提: Node.js 22 系、Docker（ローカル DB 用）。作業ディレクトリは `app/` です。

```bash
# 1. ローカル PostgreSQL を起動（docker-compose）
#    postgres:16-alpine をホスト側ポート 5433 で公開
cd app
docker compose up -d

# 2. 依存をインストール
npm install

# 3. 環境変数を用意（テンプレートをコピーして編集）
cp .env.example .env
#    DATABASE_URL は docker-compose と一致:
#    postgresql://kskphotos:kskphotos_dev@localhost:5433/photo_portfolio

# 4. Prisma クライアント生成 & スキーマ適用 & シード
npx prisma generate
npx prisma db push
npx prisma db seed   # prisma.config.ts の seed = "npx tsx prisma/seed.ts"

# 5. 開発サーバー起動（http://localhost:3001）
npm run dev
```

| npm script | 内容 |
|-----------|------|
| `npm run dev` | 開発サーバー（`next dev -p 3001`） |
| `npm run build` | 本番ビルド（`next build`） |
| `npm run start` | 本番サーバー（`next start -p 3001`） |
| `npm run lint` | ESLint |
| `npm run test` | Vitest（watch） |
| `npm run test:run` | Vitest（1 回実行。CI で使用） |

> `.env.example` には `DATABASE_URL` / `AUTH_SECRET` / `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `GCS_BUCKET_NAME` / `GCS_PROJECT_ID` / `NEXT_PUBLIC_MAPBOX_TOKEN` などのキーが用意されています。本番のみ必要なもの（GCS 等）は空のままでもローカル開発は動きます。

---

## ディレクトリ構成（抜粋）

```
kskphotos/                 ← git ルート
├── .github/workflows/     ← CI/CD（ci.yml / deploy.yml）
├── terraform/             ← GCP IaC
│   └── modules/           ← cloud-run / iam / artifact-registry / storage
├── docs/                  ← ガイド・構成図（下記リンク参照）
├── CLAUDE.md              ← プロジェクト指示書
└── app/                   ← Next.js アプリ本体
    ├── prisma/            ← schema.prisma / seed.ts
    ├── src/
    │   ├── app/           ← ルート（App Router）
    │   ├── components/    ← UI（gallery / dashboard ほか）
    │   ├── lib/           ← exif.ts / storage.ts / images.ts / image-loader.ts / auth.ts
    │   ├── generated/     ← Prisma クライアント生成先（prisma-client ジェネレータ）
    │   └── middleware.ts  ← /admin ガード
    ├── Dockerfile         ← 本番コンテナ（output: standalone）
    └── docker-compose.yml ← ローカル DB
```

---

## ドキュメント

設計の意図や仕組みは `docs/` に日本語で詳述しています。

- [01. プロジェクト全体像ガイド](./docs/01-project-overview.md) — 何を作るか・技術スタック・ページ構成
- [02. GCP Terraform ガイド](./docs/02-gcp-terraform.md) — インフラ構築・モジュール構成
- [03. GitHub Actions CI/CD ガイド](./docs/03-github-actions.md) — CI/CD パイプライン・OIDC
- [04. アーキテクチャ全体像ガイド](./docs/04-architecture.md) — リクエスト〜レンダリングの流れ
- [05. 技術スタックと採用理由](./docs/05-tech-stack-rationale.md) — なぜこの技術を選んだか
- [06. ミドルウェアとコンポーネント設計](./docs/06-middleware-and-components.md)
- [07. データモデル(Prisma)ガイド](./docs/07-data-model.md)

> **ADR（Architecture Decision Records / 設計判断の記録）** は `docs/adr/` を配置場所として予定しています（例: 「Cloud CDN を当面保留にした判断」「Cloud SQL を姉妹サイトと共有する判断」など）。現時点では未整備のため、追って追加していきます。

---

## 姉妹サイト

[kokumin-pedia](../kokumin-pedia/)（国民民主党ファンサイト）と Cloud SQL（PostgreSQL）を共有しています。DB 本体の Terraform 管理は kokumin-pedia 側にあり、kskphotos は Secret Manager 経由で接続するのみです。
