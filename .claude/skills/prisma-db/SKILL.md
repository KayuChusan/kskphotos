---
name: prisma-db
description: "DBスキーマ設計・Prisma 7.x 操作。Triggers on: テーブル追加, スキーマ変更, マイグレーション, Prisma, DB, データベース, モデル追加, リレーション, prisma generate"
---

# Prisma 7.x / PostgreSQL

## ファイル

- `app/prisma/schema.prisma` — スキーマ定義
- `app/prisma.config.ts` — Prisma 7.x 接続設定
- `app/src/generated/prisma/` — 自動生成クライアント（git管理外）
- `app/src/lib/prisma.ts` — DB接続シングルトン
- `app/prisma/seed.ts` / `seed-services.ts` / `services-data.ts` — シード（料金メニューはソース管理）

## モデル（12）

| モデル | 用途 |
|--------|------|
| User / Account / Session | 管理者認証（NextAuth.js v5） |
| Photo | 写真 + EXIF全フィールド + GPS + ビフォー画像URL |
| **Collection** | 会員解錠ギャラリーの単位（ロック対象） |
| **UnlockToken** | 解錠トークン（/u/[token]・note リンク配布） |
| Service | 料金メニュー（撮影/Web/保守/IT。SOURCE_MANAGED_IDS はデプロイで上書き同期） |
| **CaseStudy** | 制作実績（/works） |
| Booking | 撮影依頼（ステータス管理） |
| BlogPost | ブログ記事 |
| ContactMessage | お問い合わせ |
| **SiteProfile** | プロフィール（/about。/admin/profile で編集） |

## ワークフロー

```bash
cd app
npx prisma generate           # 型生成（schema 変更後は必須）
npx prisma db push            # スキーマ → ローカルDB同期（docker compose up -d が前提）
npx prisma migrate dev        # マイグレーション作成
```

## ルール

- MUST: schema 変更後は `prisma generate` で型を再生成
- MUST: generated/ は git 管理外（.gitignore）
- MUST: **本番（共有 Cloud SQL）への `prisma db push` を手元から直接叩かない**（kokumin-pedia と共有。反映は deploy.yml の additive push に任せる）
- SHOULD: フィールド追加時はデフォルト値を設定（既存データ保護）
- 知っておく: ローカルDBは `app/docker-compose.yml`（Docker Desktop 起動が前提）。dev で全ルート 500/ECONNREFUSED ならまず DB を疑う
