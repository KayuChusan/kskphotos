---
name: gallery
description: "ギャラリー機能 — 地図ビュー、EXIF自動抽出、写真管理。Triggers on: ギャラリー, 地図, マップ, EXIF, 写真アップロード, GPS, ビフォーアフター, 比較"
---

# ギャラリー機能

写真ポートフォリオの3本柱: 地図ギャラリー + EXIF ダッシュボード + ビフォーアフター

## 地図ギャラリー

- ライブラリ: Mapbox GL JS or Google Maps JavaScript API
- データソース: Photo テーブルの latitude/longitude
- GPS は EXIF から自動抽出。未埋め込みの場合はアップロード時に手動選択
- クラスタリング対応（同エリアの写真をグループ化）

## EXIF 自動抽出

- ライブラリ: `exifr` (Node.js)
- 抽出タイミング: 写真アップロード API (`/api/photos`) 内で自動実行
- 抽出フィールド: カメラ, レンズ, 焦点距離, F値, SS, ISO, GPS, 撮影日時, WB
- 撮影機材: Sony α7R IV (ILCE-7RM4) + RAW → Lightroom 現像

## EXIF ダッシュボード

- 集計: `/api/dashboard` で SQL 集計 → Recharts で可視化
- グラフ: レンズ使用率(Pie), F値分布(Bar), 撮影時間帯(Bar), 焦点距離(Histogram)

## ビフォーアフター

- RAW現像前 (ストレート現像 JPEG) と最終仕上がりをスライダーで比較
- 実装: CSS clip-path or Canvas API
- 画像: Cloud Storage に before/ after/ のプレフィックスで保存

## ルール

- MUST: EXIF 抽出はサーバーサイドで実行（exifr は Node.js 側）
- MUST: アップロード画像は Cloud Storage に保存（ローカルファイルシステム不可）
- SHOULD: 画像は WebP/AVIF に変換して配信（原本は JPEG のまま保持）
- SHOULD: サムネイル生成は Cloud Functions or アップロード時に実行
