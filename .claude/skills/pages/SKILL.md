---
name: pages
description: "ページ/ルーティング構造。Triggers on: ページ追加, ルート, URL, ルーティング, 新規ページ, page.tsx, App Router, metadata, noindex"
---

# ページ / ルーティング (App Router)

## ルート一覧（実物準拠）

### 公開ページ

| パス | 内容 | 備考 |
|------|------|------|
| `/` | トップ（`home/home-experience.tsx` に一枚岩で実装） | HALF BLEED 表紙 + ピン留めスクラブ演出 |
| `/gallery` | ギャラリー（`PhotoGallery` = グリッド/地図切替） | |
| `/gallery/[id]` | 写真詳細（EXIF・地図） | 会員写真は noindex |
| `/gallery/[id]/compare` | ビフォーアフター比較 | |
| `/collections` `/collections/[slug]` | コレクション（会員限定=ロックあり） | |
| `/works` | 撮影実績 | |
| `/dashboard` | EXIF ダッシュボード | 集計は RSC 内で prisma 直（API なし） |
| `/services` | 料金・メニュー（JSON-LD あり） | |
| `/guide` | ご利用案内 | |
| `/booking` | 撮影のご依頼 | |
| `/about` | プロフィール | |
| `/contact` | お問い合わせ（Server Action） | |
| `/privacy` | プライバシーポリシー | |
| `/blog` `/blog/[slug]` | ブログ | `BLOG_ENABLED=false`（feature-flags.ts）で **意図的に 404** |
| `/u/[token]` | 会員解錠リンク（route.ts、Cookie 発行→リダイレクト） | ページではなく Route Handler |
| `/lab` `/lab2` `/lab3` | 実験場（デザイン探求の保存版） | **noindex 必須・削除しない** |

### 管理・認証（要 Google ログイン）

`/admin` 配下に photos / collections / bookings / messages / services / case-studies / contracts / maintenance / profile / blog。`/auth/signin` が入口。

## ルール

- MUST: 公開ページは RSC デフォルト。`"use client"` は葉のコンポーネントへ
- MUST: 下層ページの扉は `ui/page-title.tsx` の `PageTitle`（EN eyebrow + 機能名タイトル）。**新しいタグライン・コピーを発明して足さない**（DESIGN.md コピー体系）
- MUST: 新ページのタイトル文字が Statement JP サブセット（`public/fonts/statement-jp.woff2`）に含まれるか確認。なければ再生成（docs/16 参照）
- MUST: metadata（title/description/OGP）を設定。実験ページ・会員系は `robots: { index: false }`
- MUST: 会員写真を含む一覧系は `photo-visibility.ts` の where 断片/マスクを通す（RSC ペイロードに本画像 URL・EXIF を漏らさない）
- SHOULD: 動的ルート param は Zod 等で検証してから DB へ
- 検証: 追加後に全ルート curl（/blog の 404 は正常）。手順の詳細は `/ship`
