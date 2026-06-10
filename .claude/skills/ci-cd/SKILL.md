---
name: ci-cd
description: "GitHub Actions CI/CDパイプライン。Triggers on: CI, CD, デプロイ, ワークフロー, GitHub Actions, mainマージ, PR, OIDC, パイプライン"
---

# GitHub Actions CI/CD

現状: 未構築。Artifact Registry + Cloud Run (Workload Identity Federation) を予定。

## ファイル

- `kskphotos/.github/workflows/ci.yml` — PR時: lint → type-check → build
- `kskphotos/.github/workflows/deploy.yml` — main push: Artifact Registry push → Cloud Run デプロイ

## ルール

- MUST: deploy は Workload Identity Federation (OIDC) でキーレス認証
- MUST: CI は PR に対して必ず実行
- SHOULD: ビルドキャッシュを活用して高速化
- SHOULD: deploy 前に lint + build が通ることを確認
