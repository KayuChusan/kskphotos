---
name: api-routes
description: "kskphotos の API 設計（Route Handler と Server Action の使い分け）。Triggers on: APIルート追加, route.ts, /api/admin, アップロードAPI, Server Action, エンドポイント"
---

# API 設計 — Route Handler と Server Action の使い分け

このプロジェクトの原則: **ミューテーションは Server Action が既定**。Route Handler（`route.ts`）は「Server Action で扱えないもの」に限る。公開 REST API は提供しない（データ取得はページの RSC で直接 Prisma）。

## 実在する Route Handler（3本のみ）

| パス | メソッド | 役割・なぜ Route Handler か |
|------|---------|---------------------------|
| `/api/admin/photos` | POST | 写真アップロード。**Server Action の multipart 解析が Cloud Run 本番で「Unexpected end of form」になるため** `req.formData()` で受ける。`maxDuration: 300`。Cloud Run のリクエスト上限 32MB 内 |
| `/api/admin/profile/image` | POST | プロフィール画像アップロード（同上の理由）。`maxDuration: 120` |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth v5 の認証ハンドラ |

## Server Action（ミューテーションの既定・`actions.ts`）

- 公開フォーム: `app/src/app/contact/actions.ts`・`booking/actions.ts`（ハニーポット＋IPレート制限 `lib/rate-limit.ts`＋Resend 通知/自動返信 `lib/mail.ts`）
- 管理系: `app/src/app/admin/{photos,bookings,messages,collections,case-studies,services,profile}/actions.ts`

## ルール

- MUST: 入力は Zod（`lib/validations/`）でバリデーション
- MUST: 管理系は NextAuth `auth()` セッション確認から始める
- MUST: アップロード系 Route Handler は `dynamic = "force-dynamic"`（Cookie を読むため）＋適切な `maxDuration`
- MUST: エラーは `NextResponse.json({ error, details? }, { status })` 形式
- SHOULD: 新規ミューテーションはまず Server Action で設計し、multipart/ストリーミング等の制約に当たった場合のみ Route Handler 化（その理由をコメントに残す）
- 公開データ取得 API を安易に追加しない（RSC で Prisma を直接呼ぶ。外部公開が必要になったら設計から相談）
