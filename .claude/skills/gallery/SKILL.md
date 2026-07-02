---
name: gallery
description: "ギャラリー機能 — 地図ビュー、EXIF抽出、画像パイプライン、会員解錠。Triggers on: ギャラリー, 地図, マップ, EXIF, 写真アップロード, GPS, ビフォーアフター, 比較, 会員, 解錠, サムネイル"
---

# ギャラリー機能

3本柱: 地図ギャラリー + EXIF ダッシュボード + ビフォーアフター。撮影機材: Sony α7R VI + RAW → Lightroom（EXIF 完全保持）。

## 地図ギャラリー

- ライブラリ: **MapLibre GL JS**（Mapbox/Google Maps ではない）— `gallery/photo-map.tsx`
- データ: Photo の latitude/longitude（EXIF GPS 自動抽出、`lib/exif.ts` / exifr）

## 画像パイプライン（`lib/photo-create.ts` → `lib/images.ts` → `lib/storage.ts`）

- sharp で WebP バリアント生成: 幅 `[400, 800, 1600, 2560]` + 16px blurDataUrl。**この配列は `lib/image-loader.ts`（next/image カスタムローダー）と必ず一致させる**
- 高画素オリジナル（〜4096px）は **非公開バケット**（`GCS_ORIGINALS_BUCKET`）へ。公開バケットは allUsers 読取のため解錠ゲートにならない。配信は解錠後の署名 URL（TTL 5分）のみ
- 保存先切替: `GCS_BUCKET_NAME` あり→GCS（本番）、なし→ローカル FS（開発）。URL はどちらも `/uploads/<file>`（本番はイメージ焼き込み or /uploads ルートが GCS へリダイレクト）
- 注意: Cloud Run はアップロード非永続 — 本番アップは GCS 前提。EXIF 抽出はサーバーサイドのみ

## 会員解錠（コレクション単位・本番稼働中）

- `/u/[token]`（Route Handler）→ トークン検証 → 署名付き Cookie `ksk_unlock`（コレクションID+トークンID）→ リダイレクト
- トークンは平文一度きり表示、DB は `tokenHash` のみ。失効はトークンID で既発行 Cookie も無効化（`unlock-server.ts`）
- 表示制御は `lib/photo-visibility.ts`: 未解錠はモザイク（`locked-photo-tile`）+ 本画像 URL / EXIF を **RSC ペイロードから除去**。トップ・/dashboard・sitemap は会員写真を除外
- 管理画面の失効/削除は `confirm()` ダイアログ → ブラウザ自動操作では押せない（手動確認が要る）

## EXIF ダッシュボード

- `/dashboard`（RSC）で prisma 直集計 → `dashboard/exif-charts.tsx`（Recharts）。専用 API はない

## ビフォーアフター

- `gallery/compare-slider.tsx`: CSS `clip-path: inset()` 実装。/gallery/[id]/compare で使用

## ルール

- MUST: EXIF 抽出・画像処理はサーバーサイド（exifr / sharp は Node 側）
- MUST: 会員写真を扱う新規一覧・API は photo-visibility を必ず通す
- MUST: VARIANT_WIDTHS を変えるなら image-loader.ts と同時に
- SHOULD: 一覧のクエリは `select` で必要カラムのみ（originalUrl を出さない）
