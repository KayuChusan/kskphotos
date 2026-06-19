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

## 独自ドメイン (kskworks.jp)

Cloud Run **ドメインマッピング**（追加課金なし・Google 自動SSL）で接続します。`terraform.tfvars` の `domain = "kskworks.jp"` が `google_cloud_run_domain_mapping` を作成します（`domain = ""` でマッピングなし）。

**公開手順（順序重要）**

1. **所有権確認**: Google Search Console で kskworks.jp を確認（指示される TXT レコードを DNS に追加）。これが済むまで apply は失敗します。
2. **apply**: `terraform apply` でマッピング作成 → `terraform output domain_mapping_records` で設定すべき **apex の A 4本 / AAAA 4本**（CNAME 不可）を取得。
3. **DNS 設定**: レジストラ/権威 DNS に上記レコードを登録（www を使う場合は `ghs.googlehosted.com` への CNAME）。SSL プロビジョニングは最大24時間。
4. **OAuth**: Google Cloud Console の OAuth クライアントに承認済みリダイレクト URI `https://kskworks.jp/api/auth/callback/google` と JS 生成元 `https://kskworks.jp` を追加。
5. **本番ログイン確認**: kskworks.jp で Google ログインが通ることを実機確認。
6. **認証の切替（確認後）**: `terraform.tfvars` に `auth_url = "https://kskworks.jp"` を追加し、`resources.tf` の `ALLOW_EMAIL_SIGNIN` を `"false"` に変更して `terraform apply`（パスワードレス email-signin を封鎖。Google ログイン確認後に実施）。

> マッピング作成・DNS・OAuth・ログイン確認は **`terraform apply` と外部操作**であり、PR マージでは反映されません（`deploy.yml` は terraform apply を実行しない）。

## メール通知 (Resend)

問い合わせ/予約は常に DB 保存され、加えて運営者へメール通知できます（`app/src/lib/mail.ts`）。**未設定なら通知は no-op**（保存は継続）。有効化手順：

1. Resend でアカウント作成 → API キー取得 → 送信元ドメイン `kskworks.jp` の認証（SPF/DKIM の DNS レコードを追加）。
2. Secret 作成: `gcloud secrets create kskphotos-resend-api-key`、`... versions add ... --data-file=-`（キーを投入）。
3. `terraform.tfvars` に `notification_email = "info@kskworks.jp"`（通知先）と `enable_resend = true` を設定 → `terraform apply`。
   - `enable_resend=false`（既定）の間は `RESEND_API_KEY` シークレットを参照しないため、未作成でも Cloud Run は起動する。
4. 送信元アドレスを変えるなら env `NOTIFICATION_FROM`（既定 `KSK Works <noreply@kskworks.jp>`）。
