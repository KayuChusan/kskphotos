# 02. GCP Terraform ガイド

## 概要

kskphotos のインフラは GCP 上に Terraform (google provider ~> 6.0) で構築します。
Cloud SQL は kokumin-pedia 側が所有しており、接続情報を Secret Manager 経由で受け取ります。

## アーキテクチャ

```
                  ┌──────────────────────────┐
                  │     Cloud CDN            │
                  │   (写真配信キャッシュ)     │
                  └──────────┬───────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    Cloud Run           Cloud Storage       Cloud SQL
    (Next.js)          (写真原本)          (PostgreSQL)
    port 8080          kskphotos-photos    ※kokumin-pedia所有
         │                                      │
         └──────────────────────────────────────┘
                             │
                   Secret Manager
                  (DATABASE_URL等)
                             │
               Workload Identity Federation
              (GitHub Actions → GCP キーレス認証)
```

## モジュール構成

| モジュール | リソース | 用途 |
|-----------|---------|------|
| `iam` | サービスアカウント × 2 + WIF | Cloud Run 実行用 + CI/CD 用 + GitHub OIDC |
| `artifact-registry` | Docker リポジトリ | コンテナイメージ保存。5世代保持 + 古い untagged 自動削除 |
| `cloud-run` | Cloud Run v2 サービス + IAM | Next.js コンテナ実行。スケール to ゼロ対応 |
| `storage` | GCS バケット + CDN + 転送ルール | 写真ストレージ + Cloud CDN でキャッシュ配信 |

## ファイル一覧

```
terraform/
├── main.tf                          # Provider (google ~> 6.0) + Backend (GCS)
├── variables.tf                     # 変数定義
├── outputs.tf                       # 出力値
├── resources.tf                     # モジュール呼び出し
└── modules/
    ├── cloud-run/
    │   ├── main.tf                  # Cloud Run v2 + public IAM
    │   ├── variables.tf
    │   └── outputs.tf
    ├── artifact-registry/
    │   ├── main.tf                  # Docker リポジトリ + クリーンアップポリシー
    │   ├── variables.tf
    │   └── outputs.tf
    ├── storage/
    │   ├── main.tf                  # GCS バケット + CDN バックエンド + 転送ルール
    │   ├── variables.tf
    │   └── outputs.tf
    └── iam/
        ├── main.tf                  # SA × 2 + WIF (GitHub OIDC)
        ├── variables.tf
        └── outputs.tf
```

## 初回デプロイ手順

### 前提条件

- GCP プロジェクト作成済み
- `gcloud` CLI インストール・認証済み
- 以下の API を有効化:
  - Cloud Run API
  - Artifact Registry API
  - Cloud Storage API
  - Compute Engine API (CDN用)
  - Secret Manager API
  - IAM API

### 手順

```bash
# 1. tfstate 用 GCS バケット作成（初回のみ）
gcloud storage buckets create gs://kskphotos-tfstate \
  --location=asia-northeast1 \
  --uniform-bucket-level-access

# 2. terraform.tfvars 作成
cat > terraform/terraform.tfvars <<EOF
gcp_project_id = "your-project-id"
gcp_region     = "asia-northeast1"
EOF

# 3. 初期化
cd terraform
terraform init

# 4. プラン確認
terraform plan

# 5. 適用
terraform apply
```

### デプロイ後の出力値

```
cloud_run_url              = "https://kskphotos-xxxxx.a.run.app"
artifact_registry_url      = "asia-northeast1-docker.pkg.dev/project-id/kskphotos"
storage_bucket_name        = "kskphotos-photos"
cdn_url                    = "http://x.x.x.x"
github_wif_provider        = "projects/.../providers/github-provider"
github_wif_service_account = "kskphotos-cicd@project-id.iam.gserviceaccount.com"
```

## コスト内訳

| サービス | 月額目安 | 備考 |
|---------|---------|------|
| Cloud Run | $0〜5 | スケール to ゼロ。無料枠: 200万リクエスト/月 |
| Cloud Storage | $0.5〜2 | Standard: $0.02/GB/月 |
| Cloud CDN | $1〜3 | キャッシュ配信: $0.08/GB |
| Artifact Registry | ~$1 | $0.10/GB。5世代保持 |
| Secret Manager | ~$0 | 6 シークレットまで無料 |
| **合計（Cloud SQL 除く）** | **$2〜11** | Cloud SQL は kokumin-pedia 側で管理 |

## Cloud SQL 共有について

Cloud SQL は kokumin-pedia のリポジトリ側で Terraform 管理されます。
kskphotos は Secret Manager に保存された `DATABASE_URL` を参照するだけです。

```
kokumin-pedia/terraform/  →  Cloud SQL を作成・管理
                              ↓ DATABASE_URL を Secret Manager に保存
kskphotos/terraform/      →  Secret Manager から読み取り → Cloud Run に注入
```

## セキュリティ

| 対策 | 実装 |
|------|------|
| キーレス認証 | Workload Identity Federation (GitHub Actions ↔ GCP) |
| シークレット管理 | Secret Manager (DATABASE_URL, API キー等) |
| 最小権限 | Cloud Run SA は secretAccessor + cloudsql.client のみ |
| リポジトリ制限 | WIF の attribute_condition で KayuChusan/kskphotos に限定 |
