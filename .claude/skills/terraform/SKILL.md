---
name: terraform
description: "Terraform IaC で GCP インフラを管理。Triggers on: Terraform変更, モジュール追加, GCP構成変更, インフラ修正, tfファイル編集, plan, apply"
---

# Terraform IaC (GCP)

現状: 未構築。GCP Cloud Run + Cloud SQL(共有) + Cloud Storage + CDN の構成を予定。

## ファイル

- `kskphotos/terraform/main.tf` — Provider (google), Backend (GCS)
- `kskphotos/terraform/variables.tf` — 変数定義
- `kskphotos/terraform/resources.tf` — モジュール呼び出し
- `kskphotos/terraform/modules/` — モジュール群

## 予定モジュール

| モジュール | リソース |
|-----------|---------|
| `cloud-run` | Cloud Run サービス + IAM |
| `storage` | Cloud Storage バケット + CDN 設定 |
| `artifact-registry` | コンテナレジストリ |
| `iam` | サービスアカウント・権限管理 |

※ Cloud SQL は kokumin-pedia 側が所有。接続情報は環境変数で受け取る。

## ワークフロー

1. `terraform/modules/` 内の対象モジュールを編集
2. `terraform plan` で差分確認
3. 差分をレビュー（意図しない削除・変更がないか）
4. `terraform apply` で適用

## ルール

- MUST: apply 前に必ず plan を実行
- MUST: state ファイルを手動編集しない
- MUST: シークレットは Secret Manager 経由（variables.tf に直書きしない）
- SHOULD: 新モジュール追加時は resources.tf にモジュールブロックを追加
