---
name: api-routes
description: "APIエンドポイント設計。Triggers on: API追加, エンドポイント, route.ts, REST API, APIルート, バリデーション, Zod"
---

# API Routes (RESTful)

## エンドポイント一覧

| メソッド | パス | 用途 |
|---------|------|------|
| GET/POST | `/api/photos` | 写真 CRUD + EXIF自動抽出 |
| GET/POST | `/api/booking` | 撮影依頼受付 + メール通知 |
| GET/POST | `/api/blog` | ブログ記事 CRUD |
| POST | `/api/contact` | お問い合わせ送信 |
| GET | `/api/dashboard` | EXIF集計データ |
| POST | `/api/upload` | Cloud Storage アップロード（署名付きURL） |

## ルール

- MUST: リクエストボディは Zod でバリデーション
- MUST: 管理系エンドポイントは認証チェック (NextAuth session)
- MUST: エラーレスポンスは統一フォーマット `{ error: string, details?: unknown }`
- SHOULD: 一覧系は cursor/limit ベースのページネーション
