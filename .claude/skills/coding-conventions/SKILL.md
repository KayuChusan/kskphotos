---
name: coding-conventions
description: "コーディング規約・プロジェクト共通ルール。Triggers on: 規約, コーディングスタイル, 命名規則, インポート, コード規約, ファイル名"
---

# コーディング規約

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル名 (コンポーネント) | kebab-case | `photo-card.tsx` |
| ファイル名 (ユーティリティ) | kebab-case | `exif.ts` |
| コンポーネント | PascalCase | `PhotoCard` |
| 関数 | camelCase | `extractExif()` |
| 定数 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| 型 / interface | PascalCase | `PhotoWithExif` |
| DB モデル | PascalCase (singular) | `Photo`, `Booking` |
| API ルート | kebab-case | `/api/photos`, `/api/booking` |

## インポート順序

1. React / Next.js
2. 外部ライブラリ
3. `@/components/`
4. `@/lib/`
5. 型 (type-only imports)

## スタイル

- Tailwind CSS v4 のユーティリティクラスを使用
- インラインスタイルは使わない
- `cn()` (clsx + twMerge) でクラスを結合

## ルール

- MUST: `"use client"` は必要なコンポーネントにのみ付与
- MUST: Server Component をデフォルトとする
- MUST: 型は `interface` を優先（`type` は Union/Intersection 時のみ）
- SHOULD: コメントは「なぜ」に限定。「何を」はコードで表現
