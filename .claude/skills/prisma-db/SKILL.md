---
name: prisma-db
description: "DBスキーマ設計・Prisma 7.x 操作。Triggers on: テーブル追加, スキーマ変更, マイグレーション, Prisma, DB, データベース, モデル追加, リレーション, prisma generate"
---

# Prisma 7.x / PostgreSQL

## ファイル

- `kskphotos/app/prisma/schema.prisma` — スキーマ定義
- `kskphotos/app/prisma.config.ts` — Prisma 7.x 接続設定
- `kskphotos/app/src/generated/prisma/` — 自動生成クライアント (git管理外)
- `kskphotos/app/src/lib/prisma.ts` — DB接続シングルトン

## モデル (8つ)

| モデル | 用途 |
|--------|------|
| User | 管理者認証 |
| Account / Session | NextAuth.js v5 |
| Photo | 写真 + EXIF全フィールド + GPS + ビフォー画像URL |
| Service | 撮影メニュー（ポートレート/イベント等） |
| Booking | 撮影依頼（ステータス管理） |
| BlogPost | ブログ記事 |
| ContactMessage | お問い合わせ |

## ワークフロー

```bash
cd app
npx prisma generate --watch   # 型生成（開発中）
npx prisma db push            # スキーマ → DB同期（開発中）
npx prisma migrate dev        # マイグレーション作成
```

## ルール

- MUST: schema 変更後は `prisma generate` で型を再生成
- MUST: generated/ は git 管理外 (.gitignore)
- SHOULD: フィールド追加時はデフォルト値を設定（既存データ保護）
