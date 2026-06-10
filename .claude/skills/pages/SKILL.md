---
name: pages
description: "ページ/ルーティング構造。Triggers on: ページ追加, ルート, URL, ルーティング, 新規ページ, page.tsx, App Router"
---

# ページ / ルーティング (App Router)

## ルート一覧 (12ページ + 管理4ページ)

### 公開ページ

| パス | ページ内容 |
|------|----------|
| `/` | トップ（ヒーロー写真 + 最新作品） |
| `/gallery` | フォトギャラリー（グリッド / 地図 切替） |
| `/gallery/[id]` | 写真詳細（EXIF + 撮影ストーリー + 地図） |
| `/gallery/[id]/compare` | ビフォーアフター比較 |
| `/dashboard` | EXIF ダッシュボード（レンズ/F値/時間帯集計） |
| `/services` | 撮影メニュー・料金 |
| `/booking` | 撮影依頼フォーム |
| `/about` | プロフィール |
| `/blog` | ブログ一覧 |
| `/blog/[slug]` | ブログ記事詳細 |
| `/contact` | お問い合わせ |
| `/privacy` | プライバシーポリシー |

### 管理ページ (要認証)

| パス | 用途 |
|------|------|
| `/admin` | 管理ダッシュボード |
| `/admin/photos` | 写真管理・アップロード |
| `/admin/bookings` | 撮影依頼管理 |
| `/admin/blog` | ブログ記事管理 |

## ルール

- MUST: 公開ページは Server Component (RSC) をデフォルトにする
- MUST: 動的ルートのパラメータは Zod でバリデーション
- SHOULD: metadata (title, description, OGP) を各ページに設定
- SHOULD: loading.tsx / error.tsx を必要に応じて配置
