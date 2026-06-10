---
name: components
description: "UIコンポーネント・shadcn/ui。Triggers on: コンポーネント追加, UI, shadcn, ボタン, カード, レイアウト, チャート, スタイル"
---

# UI コンポーネント

## ディレクトリ構成

```
src/components/
├── ui/                    # shadcn/ui (自動生成、カスタム最小限)
├── gallery/               # ギャラリー関連
│   ├── photo-grid.tsx     # グリッドビュー
│   ├── photo-map.tsx      # 地図ビュー (Mapbox/Google Maps)
│   ├── photo-card.tsx     # 写真カード
│   └── exif-badge.tsx     # EXIF 情報バッジ
├── compare/
│   └── before-after-slider.tsx  # ビフォーアフタースライダー
├── dashboard/
│   ├── lens-chart.tsx     # レンズ使用率 (Recharts)
│   ├── aperture-chart.tsx # F値分布
│   ├── time-chart.tsx     # 撮影時間帯
│   └── camera-stats.tsx   # 総合統計
├── booking/
│   └── booking-form.tsx   # 撮影依頼フォーム
└── layout/
    ├── site-header.tsx    # ヘッダー
    └── site-footer.tsx    # フッター
```

## ルール

- MUST: shadcn/ui コンポーネントは `src/components/ui/` に配置
- MUST: `"use client"` はインタラクティブなコンポーネントにのみ付与
- SHOULD: コンポーネントの props は interface で型定義
- SHOULD: Recharts チャートは ResponsiveContainer でラップ
