# kskphotos

個人写真ポートフォリオサイト。撮影依頼を受けるための商用サイト + 技術ショーケース。

**Stack**: Next.js 16 + React 19 + Prisma 7.x + Terraform on GCP (Cloud Run + Cloud SQL PostgreSQL)
**Repo**: `app/` = Next.js, `terraform/` = IaC, `docs/` = ガイド・構成図
**姉妹サイト**: [kokumin-pedia](../kokumin-pedia/) — 国民民主党ファンサイト（自動運転）、Cloud SQL を共有

## 差別化機能（3本柱）

1. **地図ギャラリー** — 撮影場所ベースで写真を Mapbox/Google Maps 上に展開。EXIF GPS 自動抽出
2. **EXIF ダッシュボード** — レンズ使用率、F値分布、撮影時間帯を Recharts で可視化
3. **ビフォーアフター** — RAW→仕上がりのスライダー比較

## 撮影環境

- カメラ: Sony α7R IV (ILCE-7RM4)
- 撮影: RAW → Lightroom 現像 → JPEG 書き出し
- EXIF は Lightroom 書き出し後も完全保持

## 開発ルール

- **ドキュメント必須**: 設計判断・手順（セットアップ/ビルド/テスト/デプロイ/運用）を追加・変更したら、**同じコミットで** `docs/`（日本語・連番 `NN-*.md`・表中心、図は `docs/diagrams/`）を更新する。`docs/01-project-overview.md` のドキュメント一覧・進捗表も同期。機能/手順は doc 更新まで含めて「完了」とする。
- **コミット前レビュー**: コード変更はコミット前に Codex レビュー（`/codex:review`）を通す。レビュー専用なので修正は別途 `/codex:rescue` 等で対応。
- **テスト**: `app/` で Vitest。実行は `npm --prefix app run test:run`。
- **デザイン**: UI の追加・変更は [`DESIGN.md`](./DESIGN.md)（awesome-design-md-jp 準拠の9セクション）に従う。配色は `@theme` トークン、和文は palt・最小12px・行間1.7〜2.0・AAコントラスト、タッチ44px、focus-visible と reduced-motion を必須。

## Skills

| コマンド | 用途 |
|---------|------|
| `/terraform` | Terraform IaC — GCP モジュール管理、plan/apply |
| `/docker` | Docker — ローカル環境 (docker-compose)、Dockerfile |
| `/ci-cd` | GitHub Actions — CI/CD パイプライン、OIDC デプロイ |
| `/prisma-db` | Prisma 7.x — スキーマ設計、マイグレーション |
| `/pages` | ページ/ルーティング — 12ルート、App Router |
| `/api-routes` | API設計 — RESTful エンドポイント |
| `/components` | UI — shadcn/ui、Recharts、地図、ビフォーアフター |
| `/gallery` | ギャラリー機能 — 地図ビュー、EXIF、写真管理 |
| `/coding-conventions` | コーディング規約 — 命名、インポート、スタイル |

## GCP インフラ構成

| サービス | 役割 | 月額目安 |
|---------|------|---------|
| Cloud Run | Next.js コンテナ（スケール to ゼロ） | $0〜5 |
| Cloud SQL | PostgreSQL（kokumin-pedia と共有） | $7〜10（共有） |
| Cloud Storage | 写真原本 + ビフォー画像 | $0.5〜2 |
| Cloud CDN | 画像配信 | $1〜3 |
| Artifact Registry | コンテナレジストリ | ~$1 |
