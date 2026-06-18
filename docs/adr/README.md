# ADR インデックス

## このドキュメントの目的

kskphotos で下した「重要な技術判断」を、1 つずつ記録として残すための索引です。各判断の背景・選んだ理由・捨てた選択肢・トレードオフを、後から読み返せる形でまとめています。

このサイトは **写真ポートフォリオ + 撮影依頼の商用サイト**であると同時に、**技術ショーケース**でもあります。そのため ADR では「Next.js でのフルスタック実装をどう組んだか（アプリ寄りの判断）」と「GCP のクラウド構成・IaC・CI/CD をどう設計したか（インフラ寄りの判断）」の**両面**を記録します。両者がそろって初めて、このポートフォリオが見せたい「アプリも作れて、クラウドにも乗せられる」という像が伝わるからです。

> 注: すべての記述は、実際のソースコード（`app/`）と Terraform（`terraform/`）・GitHub Actions（`.github/workflows/`）を確認したうえで書いています。「やっていると書いてあるが実際は違う」が起きないよう、各判断には対応するファイル名を併記します。

## ADR とは

**ADR（Architecture Decision Record / アーキテクチャ決定記録）** とは、「なぜこの技術・構成を選んだのか」という設計上の重要な判断を、**1 決定につき 1 ファイル**で短く書き残す慣習です。

コードを読めば「何をしているか（What）」は分かりますが、「なぜそうしたか（Why）」「他に何を検討して、なぜ採らなかったか」はコードに残りません。時間が経つと本人すら忘れますし、新しく加わった人や採用担当者には伝わりません。ADR はその「Why」を補う薄いドキュメントです。

ADR の典型的な構成は次のとおりです。

| 項目 | 内容 |
|------|------|
| Context（背景） | どんな状況・制約のもとで判断したか |
| Decision（決定） | 結局どうすることにしたか |
| Alternatives（代替案） | 比較検討して見送った選択肢 |
| Consequences（結果） | その決定で得たもの・引き受けたトレードオフ |

> 補足: ADR は「一度書いたら正解」ではなく、**判断した時点のスナップショット**です。前提が変われば新しい ADR で上書き（supersede）していきます。kskphotos でも、たとえば後述の Cloud CDN のようにコスト都合で「保留」している判断は、無理に「導入済み」と書かず、保留のまま正直に記録しています。

## ADR 一覧

| 番号 | タイトル | 1 行サマリ |
|------|---------|-----------|
| [001](./001-cloud-run.md) | Cloud Run 採用（GKE 比） | コンテナ実行基盤に GKE ではなく **Cloud Run** を採用。`min_instance_count = 0`（スケール to ゼロ）と `cpu_idle = true` で、無アクセス時のコストを実質ゼロに抑える個人サイト向けの選択（`terraform/modules/cloud-run/main.tf`）。 |
| [002](./002-cloud-sql-shared.md) | Cloud SQL 共有 | 専用 DB を立てず、姉妹サイト kokumin-pedia の **Cloud SQL（PostgreSQL）インスタンスを共有**。DB 本体は kokumin-pedia 側 Terraform が所有し、kskphotos は接続情報（Secret Manager の `DATABASE_URL`）と Cloud SQL への接続経路だけを持つ（`terraform/resources.tf`）。 |
| [003](./003-prisma-driver-adapter.md) | Prisma driver adapter | Prisma 7 を **driver adapter（`@prisma/adapter-pg` の `PrismaPg`）** 構成で利用し、純 JS の `pg` ドライバ経由で PostgreSQL に接続する（`app/src/lib/prisma.ts`）。Node ランタイムと素直にかみ合う接続方法を選んだ。 |
| [004](./004-image-pipeline.md) | 事前生成 WebP 画像パイプライン | アップロード時に **Sharp で複数幅の WebP を事前生成**（`app/src/lib/images.ts` の `VARIANT_WIDTHS = [400, 800, 1600, 2560]`）。next/image の **カスタムローダー（`app/src/lib/image-loader.ts`）** が表示幅に合う事前生成ファイルへ URL を差し替え、実行時の画像変換を行わない。 |
| [005](./005-maplibre.md) | MapLibre 採用（Google Maps 比） | 地図ギャラリーの地図描画に **MapLibre GL JS** を採用（`app/src/components/gallery/photo-map.tsx`）。Google Maps / Mapbox の有料 API キーや従量課金を避け、CARTO のラスタータイル + OSS ライブラリでキーレス・低コストに地図表示を実現する。 |

## 両面（フルスタック × クラウド）との対応

このポートフォリオの訴求軸は「アプリ実装（Next.js フルスタック）」と「クラウド運用（GCP / Terraform / CI-CD）」の両面です。各 ADR がどちら側の判断かを示すと、次のようになります。

| 軸 | 該当 ADR |
|----|---------|
| クラウド・IaC 寄りの判断 | 001（Cloud Run）、002（Cloud SQL 共有） |
| アプリ実装寄りの判断 | 003（Prisma adapter）、004（画像パイプライン）、005（MapLibre） |

> 認証ガード（`middleware.ts` + NextAuth v5）、RSC + ISR（`revalidate = 3600`）+ `generateStaticParams` によるレンダリング戦略、CI/CD（`ci.yml` の lint / type-check / Vitest / build、`deploy.yml` の Workload Identity Federation 認証）などは、現時点では個別 ADR にしていません。判断の経緯を残す価値が出たら、新しい番号で追記していきます。

## 凡例

- 番号順（001 → 005）は「インフラ寄りの基盤判断 → アプリ寄りの実装判断」のおおまかな流れになっています。
- 各 ADR は対応するソースコード・Terraform モジュールを参照しながら読むと、判断とコードの対応が掴めます。

## 関連ドキュメント

- [01. プロジェクト全体像ガイド](../01-project-overview.md)
- [02. GCP Terraform ガイド](../02-gcp-terraform.md)
- [03. GitHub Actions CI/CD ガイド](../03-github-actions.md)
- [04. アーキテクチャ全体像ガイド](../04-architecture.md)
- [05. 技術スタックと採用理由](../05-tech-stack-rationale.md)
- [06. ミドルウェアとコンポーネント設計](../06-middleware-and-components.md)
- [07. データモデル（Prisma）ガイド](../07-data-model.md)
