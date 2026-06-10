---
name: docker
description: "Docker開発環境とコンテナビルド。Triggers on: Docker, docker-compose, コンテナ, ローカル環境起動, Dockerfile修正, ビルド, ローカルDB"
---

# Docker 環境

## ファイル

- `kskphotos/app/Dockerfile` — 本番用 (Cloud Run 向け、マルチステージビルド)
- `kskphotos/app/docker-compose.yml` — ローカル開発用 (PostgreSQL)

## ローカル開発

```bash
cd app
docker compose up -d     # PostgreSQL 起動
npm run dev              # Next.js 開発サーバー
```

## ルール

- MUST: Dockerfile はマルチステージビルド (deps → builder → runner)
- MUST: 本番イメージは `node:22-alpine` ベース
- MUST: `standalone` 出力モードを使用
- SHOULD: .dockerignore でビルドコンテキストを最小化
