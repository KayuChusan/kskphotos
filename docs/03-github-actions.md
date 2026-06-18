# 03. GitHub Actions CI/CD ガイド

## 概要

kskphotos では GitHub Actions で CI/CD パイプラインを構築しています。
GCP への認証は **Workload Identity Federation (WIF)** を使い、サービスアカウントキーを一切使いません。

## ワークフロー一覧

| ファイル | トリガー | 内容 |
|---------|---------|------|
| `ci.yml` | PR → main | Postgres 起動 → lint → type-check → test → build |
| `deploy.yml` | push → main | WIF認証 → Docker build → Artifact Registry push → Cloud Run デプロイ |

## CI パイプライン (`ci.yml`)

```
PR 作成/更新
    │
    ▼
┌──────────────────────┐
│  Postgres 16 service  │ ← ビルド時 DB 接続用
│  checkout             │
│  setup-node 22        │
│  npm ci               │
│  prisma generate      │
│  prisma db push       │ ← テスト用DBにスキーマ適用
│  npm run lint         │
│  tsc --noEmit         │
│  npm run test:run     │ ← Vitest ユニットテスト
│  npm run build        │
└──────────────────────┘
    │
    ▼
  ✅ or ❌ → PR にステータス表示
```

### なぜ CI に Postgres が必要か

`next build` は `generateStaticParams`（`/collections/[slug]`、`/gallery/[id]` など）で
**ビルド時に DB へクエリ**するため、DB が無いと `ECONNREFUSED` でビルドが失敗する。
そのため CI ジョブに `postgres:16` サービスコンテナを立て、`DATABASE_URL` をそこへ向け、
`prisma db push` で空スキーマを適用してからビルドする（`deploy.yml` は Cloud SQL Auth Proxy で同等の役割）。

## Deploy パイプライン (`deploy.yml`)

```
main に push (PR マージ)
    │
    ▼
┌──────────────────────────────────┐
│ 1. GCP 認証 (WIF — キーレス)      │
│    google-github-actions/auth@v2 │
│    ↓                             │
│ 2. Docker build                  │
│    tag: sha + latest             │
│    ↓                             │
│ 3. Artifact Registry push       │
│    asia-northeast1-docker.pkg.dev │
│    ↓                             │
│ 4. Cloud Run deploy             │
│    google-github-actions/        │
│    deploy-cloudrun@v2            │
└──────────────────────────────────┘
    │
    ▼
  デプロイ完了 → URL 表示
```

## GitHub Secrets 設定

以下の Secrets を GitHub リポジトリに設定する必要があります。

| Secret 名 | 値 | 取得方法 |
|-----------|-----|---------|
| `GCP_PROJECT_ID` | GCP プロジェクト ID | GCP コンソール |
| `GCP_WIF_PROVIDER` | WIF プロバイダーの完全修飾名 | `terraform output github_wif_provider` |
| `GCP_SA_EMAIL` | CI/CD サービスアカウント | `terraform output github_wif_service_account` |

### 設定コマンド

```bash
# Terraform output から値を取得
cd terraform
WIF_PROVIDER=$(terraform output -raw github_wif_provider)
SA_EMAIL=$(terraform output -raw github_wif_service_account)

# GitHub Secrets に設定
gh secret set GCP_PROJECT_ID --body "your-project-id"
gh secret set GCP_WIF_PROVIDER --body "$WIF_PROVIDER"
gh secret set GCP_SA_EMAIL --body "$SA_EMAIL"
```

## WIF 認証の仕組み

```
GitHub Actions                    GCP
    │                              │
    ├─ OIDC トークン発行 ──────────→│
    │  (リポジトリ情報を含む)         │
    │                              ├─ WIF Pool で検証
    │                              │  attribute_condition:
    │                              │  repository == "KayuChusan/kskphotos"
    │                              │
    │←── 一時的な認証トークン ────────┤
    │                              │
    ├─ Artifact Registry push ────→│
    ├─ Cloud Run deploy ──────────→│
    │                              │
  完了                             完了
```

**メリット**:
- サービスアカウントキー（JSON）が不要 → 漏洩リスクゼロ
- トークンは短寿命（1時間）→ 永続的な認証情報なし
- リポジトリ単位で制限 → 他のリポジトリからは認証不可

## AWS (kokumin-pedia) との比較

| 項目 | kokumin-pedia (AWS) | kskphotos (GCP) |
|------|-------------------|-----------------|
| 認証方式 | OIDC → IAM Role | WIF → Service Account |
| レジストリ | ECR | Artifact Registry |
| デプロイ先 | ECS Fargate | Cloud Run |
| デプロイ方法 | タスク定義更新 → サービス更新 | `deploy-cloudrun` アクション一発 |
| 待機 | `wait-for-service-stability` | 不要（Cloud Run が自動ロールアウト） |
