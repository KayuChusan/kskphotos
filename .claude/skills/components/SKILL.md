---
name: components
description: "UIコンポーネント・デザインシステム実装。Triggers on: コンポーネント追加, UI, shadcn, ボタン, カード, アニメーション, statement-jp, slam, サーフェス, モーション"
---

# UI コンポーネント

デザインの正典は [`DESIGN.md`](../../DESIGN.md)。ここは実装の勘所のみ。

## ディレクトリ構成（実物準拠）

```
src/components/
├── ui/          # shadcn/ui + 自作: page-title(下層扉) / ja-text(和文組) / section-mark
├── home/        # home-experience(トップ本体・大型) / home-contact-form(受付用紙) / brush-stroke / booking-flow
├── gallery/     # photo-grid(=PhotoGallery) / photo-map / photo-lightbox / compare-slider / exif-table / locked-*(会員マスク)
├── layout/      # site-header(data-header-dark追従) / site-footer / nav-config.ts
├── dashboard/   # exif-charts (Recharts)
├── diagram/     # flow-diagram
└── analytics/   # google-analytics
```

## 三声のタイポグラフィ

| 声 | 書体 | 用途 |
|----|------|------|
| 断言 | `.statement-jp`（Noto Sans JP Black サブセット） | ブランドコピー・ページタイトル・大見出し |
| 情感 | `font-heading`（Fraunces 明朝） | 写真文脈の見出し・引用 |
| 機械 | `font-mono`（Geist Mono） | eyebrow・EXIF・価格・ラベル |

## サーフェス・信号色

- 面: `.paper`（白い紙・暗面上でライトトークン復元）/ `.slam`（エレクトリックブルー）/ `.bluehour`(濃紺)
- 信号: `--rec`(REC赤=録画中・トリムマーク・●) / `--film`(フィルム黄) / `--ink`
- 暗い面のセクションには `data-header-dark` を付与（site-header が白抜きに追従）。スクラブ演出中は `useMotionValueEvent` で動的に付け外し

## モーションの掟（機能停止バグ2回の教訓）

- MUST: **opacity は常に 1**。アニメーションは transform / blur / scale のみ（マウントアニメ固着でコンテンツ不可視になる事故防止）
- MUST: 全画面オーバーレイ（イントロ等）は `setTimeout` フェイルセーフで必ず消す
- MUST: `prefers-reduced-motion` 分岐 + scroll-driven CSS は `@supports (animation-timeline: view())` ガード
- MUST: 横方向にはみ出す装飾を足したら `html,body { overflow-x: clip }` が守っている前提を壊さない（iOS 斜めパン→スクロール巻き戻りバグの根治策）

## 落とし穴

- `.statement-jp` は `color: var(--ink)` を持ち Tailwind の text-* に勝つ → `.slam` 内などでは inline style で色指定（docs/16 追補9）
- dev サーバー起動中に `npm run build` すると .next が壊れる → 先に `pkill -f "next dev"`
- レスポンシブ確認は `public/dev-viewport.html`（390/768 iframe、dev 限定で frame-ancestors 許可）

## ルール

- MUST: shadcn/ui は `src/components/ui/` に。`"use client"` はインタラクティブな葉のみ
- MUST: クライアントへ渡す photo は `select` で最小化（originalUrl・未解錠 EXIF を RSC ペイロードに出さない）
- SHOULD: Recharts は ResponsiveContainer でラップ。props は型定義
