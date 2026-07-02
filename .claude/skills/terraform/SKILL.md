---
name: terraform
description: "Terraform IaC で GCP インフラを管理。Triggers on: Terraform変更, モジュール追加, GCP構成変更, インフラ修正, tfファイル編集, plan, apply"
---

# Terraform IaC (GCP)

現状: **構築済み・本番稼働中**（kskworks.jp = Cloud Run + 共有 Cloud SQL + Storage）。

## ファイル

- `terraform/main.tf` — Provider (google), Backend (GCS)
- `terraform/variables.tf` — 変数定義
- `terraform/resources.tf` — モジュール呼び出し
- `terraform/outputs.tf` — 出力（WIF provider / SA / DNSレコード等）
- `terraform/terraform.tfvars` — 実値（**gitignore 対象**。auth_url 等はローカル＋本番のみ）
- `terraform/modules/` — cloud-run / storage / artifact-registry / iam

## モジュール

| モジュール | リソース |
|-----------|---------|
| `cloud-run` | Cloud Run サービス + IAM + ドメインマッピング（kskworks.jp） |
| `storage` | Cloud Storage バケット（+ **CDN は保留中**） |
| `artifact-registry` | コンテナレジストリ |
| `iam` | サービスアカウント + Workload Identity Federation（`github_repo` = kskworks/kskphotos） |

※ Cloud SQL は kokumin-pedia 側 TF が所有。接続情報は Secret Manager 経由。

## ワークフロー

1. 対象ファイルを編集
2. `terraform plan -target='<対象リソース>'` で差分確認
3. 差分をレビュー（意図しない削除・置換・巻き添えがないか）
4. `terraform apply -target='<対象リソース>'` で適用

## ルール

- **MUST: apply は必ず `-target` 指定**。**全リソース apply は保留中の CDN（~$18/月）を作成してしまう**（課金事故）。例: `terraform apply -target='module.cloud_run.google_cloud_run_v2_service.app'`
- MUST: apply 前に必ず同じ `-target` で plan を実行
- MUST: state ファイルを手動編集しない
- MUST: シークレットは Secret Manager 経由（variables.tf に直書きしない）
- 知っておく: deploy.yml とのドリフト対策として cloud-run service に `lifecycle.ignore_changes`（image/labels 等）設定済み。service の env 変更は上記 -target で image 巻き添えなく apply できる
- 知っておく: GitHub オーナー名を変更したら `resources.tf` の `github_repo` を更新して WIF を apply し直す（OIDC が旧名で拒否される）
- SHOULD: 新モジュール追加時は resources.tf にモジュールブロックを追加し、docs/02 を同コミットで更新
