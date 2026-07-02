---
name: ci-cd
description: "GitHub Actions CI/CDパイプライン。Triggers on: CI, CD, デプロイ, ワークフロー, GitHub Actions, mainマージ, PR, OIDC, パイプライン"
---

# GitHub Actions CI/CD

現状: **構築済み・稼働中**（PR→CI、main マージ→本番デプロイが自動で回る）。

## ファイル（実フロー）

- `.github/workflows/ci.yml` — PR 時 `lint-and-build`（約1.5分）:
  `npm ci` → `prisma generate` → `prisma db push`（CI用DB） → lint → `tsc --noEmit` → test → build
- `.github/workflows/deploy.yml` — main push 時 `Deploy to GCP`:
  OIDC 認証（`google-github-actions/auth@v2` + WIF）→ GCS から写真アセット同期 → Cloud SQL Auth Proxy 起動 → `prisma db push`（**additive・非破壊**）＋ `seed-services.ts` 実行 → Docker build（`--build-arg DATABASE_URL` / `--build-arg NEXT_PUBLIC_GA_ID`）→ Artifact Registry push → `deploy-cloudrun@v2`

## 知っておく（実運用の要点）

- **WIF のリポジトリ制限**は `terraform/resources.tf` の `github_repo`（現: kskworks/kskphotos）。**リポジトリのオーナー/名前を変えると OIDC が拒否される**→ terraform 側を更新して apply（/terraform 参照）
- **`NEXT_PUBLIC_*` はビルド時埋め込み**。ランタイム env では効かない → deploy.yml の `--build-arg` に配線が必要（GA_ID で実績）
- デプロイ中の **Prisma P2037（コネクション枯渇）は再実行で解消**: `gh run rerun <id>`
- `seed-services.ts` は createOnly だが **SOURCE_MANAGED_IDS の4件（撮影/制作/保守/IT）は毎デプロイ上書き同期**（料金はソースが正）
- deploy.yml は image を `:<github.sha>` でデプロイし env は保持。Terraform 側は lifecycle.ignore_changes でドリフト回避

## ルール

- MUST: deploy は Workload Identity Federation（OIDC）でキーレス認証（SA キーを作らない）
- MUST: CI は PR に対して必ず実行（マージは CI green が前提）
- MUST: マージ後は deploy.yml の conclusion=success と本番 curl 確認まで見届ける（/ship 参照）
- SHOULD: ワークフロー変更は小さく分け、実行ログで検証してから重ねる
