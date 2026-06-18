# DESIGN.md — kskphotos / KSK Works

> AI コーディングエージェント・人間の双方が、UI を一貫して実装・変更するためのデザイン仕様書です。
> 形式は [awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp) の 9 セクション構成に準拠します。
> 実体は `app/src/app/globals.css`（トークン定義）と `app/src/app/layout.tsx`（フォント）。本書と実装が食い違う場合はコードを正とし、本書を更新してください。

**テーマ要約（3〜5語）**: 印画紙の生成り × 暗室のセーフライト / 静謐・作品本位・上質

---

## 1. ビジュアルテーマ & 雰囲気

写真の制作プロセス（暗室・現像・カメラ）をメタファに落とし込んだ、静かで上質な世界観。作品（写真）が主役で、UI は黒子に徹する。商用（撮影依頼）サイトとしての信頼感を、装飾過多ではなく余白とトーンで担保する。

写真メタファ語彙（各装飾の出自）:

| 語彙 | 意味 | 実装 |
|------|------|------|
| 印画紙（生成り） | 背景の暖色オフホワイト | `--background` |
| 暗室のセーフライト | 唯一の彩度あるアクセント（琥珀） | `--safelight` / `--safelight-strong` |
| ファインダー | 画像ホバー時のコーナーブラケット | `.viewfinder` |
| 現像 | スクロール進入で像が結ぶ（blur→鮮明） | `.develop`（scroll-driven） |
| 絞り羽根 | ライトボックスを開く円形ワイプ | `.lightbox-iris` |
| HUD / EXIF | 計器風のモノスペース表記 | `.eyebrow` / `.exif-text` |

情報密度: 中〜低。余白広め。デスクトップはやや高密度（コンパクトなコントロール）、モバイルは指で押せる密度へ。

---

## 2. 配色 & ロール

OKLCH で全トークンを統一管理。色相は暖色帯（hue 55〜85）に集約し、世界観の一体感を出す。ライト＝「印画紙」、ダーク＝「暗室」。

### ライト（`:root`）

| トークン | 値 (OKLCH) | 役割 |
|---------|-----------|------|
| `--background` | `0.975 0.008 85` | 背景（生成り） |
| `--foreground` | `0.27 0.012 75` | 本文（対背景 ≈14:1） |
| `--muted-foreground` | `0.49 0.018 75` | 補助テキスト（AA 合格 ≈5.8:1） |
| `--primary` | `0.32 0.02 70` | 主ボタン背景（CTA） |
| `--safelight` | `0.62 0.13 60` | **塗り/装飾用**の明るい琥珀（バッジ・ドット・チャート） |
| `--safelight-strong` | `0.52 0.14 55` | **テキスト/nav active 用**の AA 準拠琥珀（本文 4.5:1 以上） |
| `--border` / `--input` | `0.88 0.014 85` | 罫線（非テキスト） |
| `--ring` | `0.68 0.12 70` | フォーカスリング |

### ダーク（`.dark`）

「暗室」。`--background 0.115`、`--safelight 0.78 0.14 70`（対背景 ≈9.9:1 と高コントラスト）。`--safelight-strong` は同値。sidebar 系も暖色トーンに統一（shadcn 既定の青紫/無彩色は除去済み）。

### コントラスト規定（Do）
- 本文テキスト: WCAG AA **4.5:1** 以上。非テキスト（罫線・アイコン）: **3:1** 以上。
- **琥珀の使い分け**: 意味のあるテキスト・nav active には `--safelight-strong`（= `.text-safelight` が参照）。塗り（`bg-safelight`）・ドット・チャート系列には明るい `--safelight`。
- アクセントは少量に。1 画面でセーフライトを多用しない（「暗室で唯一灯る安全光」）。

---

## 3. タイポグラフィ規則【和文重視・最重要】

### 3.1 役割別書体（`layout.tsx` / next/font）
| 役割 | 書体 | 変数 |
|------|------|------|
| 和文 本文 | Zen Kaku Gothic New（やわらかい角ゴ） | `--font-jp` |
| 和文 見出し | Zen Maru Gothic（丸ゴ） | `--font-jp-heading` |
| 欧文 ディスプレイ | Fraunces（ソフトセリフ） | `--font-display` |
| 欧文 本文 | Geist | `--font-geist-sans` |
| 数値・HUD | Geist Mono | `--font-geist-mono` |

### 3.2 フォントスタック（必須: 和文→欧文→システム和文→generic）
`globals.css` の `@theme` で合成。**システム和文フォールバックを必ず含める**（Web フォント未読込・失敗時も和文が崩れない）:
```css
--font-sans: var(--font-geist-sans), var(--font-jp),
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", "Meiryo", system-ui, sans-serif;
--font-heading: var(--font-display), var(--font-jp-heading),
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
```

### 3.3 行間・字間・OpenType（`body` にグローバル付与）
```css
body {
  line-height: 1.8;                         /* 和文本文（推奨 1.7〜2.0、最低 1.5、1.2 以下禁止） */
  font-feature-settings: "palt" 1, "kern" 1; /* 和文プロポーショナル詰め + 欧文カーニング */
  line-break: strict;                        /* 禁則 */
  overflow-wrap: anywhere;                   /* 長い英数字（レンズ名・URL）を折り返す */
  word-break: normal;
}
h1, h2, h3 { line-height: 1.3; text-wrap: balance; }
p { text-wrap: pretty; }
```

### 3.4 letter-spacing
- 全角本文/ラベル: **0.04〜0.1em**。見出し: **0〜0.05em**（`tracking-wide` 程度）。
- **和文に 0.3em は禁止**（`.eyebrow` の `tracking-[0.3em]` は欧文キャプス専用）。和文ラベルは `.eyebrow-jp`（`tracking-[0.08em]`, `text-xs`）を使う。

### 3.5 最小サイズ
- 和文を含むテキストは **12px（`text-xs`）以上**。`8〜10px`（`.exif-text` 等）は**欧文・記号・数値専用**。

### 3.6 FOUT 対策
和文 Web フォントは `preload: false`。読込中は上記フォールバック連鎖のシステム和文で自然に表示されるため、連鎖を壊さないこと。

---

## 4. コンポーネント

- **shadcn/ui プリミティブ**（`@base-ui/react` ベース）を基盤に、`@theme` トークンを参照。状態は **hover / focus-visible（`ring-3`）/ disabled / aria-invalid** を網羅。
- **独自インタラクティブ要素**（素の `<button>` 等）にも focus-visible リングと選択状態 `aria-pressed` / `aria-current` を付与する（例: ギャラリーのカテゴリフィルタ）。
- **ボタン密度**: デスクトップはコンパクト（`h-8` 既定）。モバイルのタッチ要素は **44px**（`size-11` / `py-2`）を確保。
- **一次 CTA**（「ご依頼・ご相談」）は塗りボタン（`variant="default"`）で最も目立たせる。
- 独自演出コンポーネント: `viewfinder` / `develop` / `lightbox-iris` / `bg-aurora` / セーフライトのドット。過剰にならない範囲で世界観の一貫性を保つ。

---

## 5. レイアウト原則

- コンテナ: `container mx-auto px-4` を基本ラッパに統一。最大幅は `@utility container` で `90rem`（1440px）。
- 縦リズム: セクション `py-20`〜`py-24`、見出し直下 `mt-3`〜`mt-4`。
- 本文計測幅: 和文の可読のため長文は `max-w-xl` 目安。
- ギャラリー: マソンリー `columns-1 sm:columns-2 lg:columns-3`。2 カラムセクションは `lg:grid-cols-2`。

---

## 6. 深度 & エレベーション

- `--radius`（`0.625rem`）基準に `sm(0.6x)`〜`4xl(2.6x)` のスケールを定義済み。
- 影: Tailwind の `shadow-*` を **暖色トークン化済み**（`@theme` で `--shadow-2xs`〜`--shadow-xl` を黒ではなく前景色 `oklch(0.27 0.012 75)` の低不透明度に定義。印画紙トーンに馴染む）。`shadow-sm/md/lg` がそのまま暖色影に。面の前後は カード < ポップオーバー < ダイアログ。

---

## 7. Do & Don't

**Do**
- 和文フォールバック連鎖（システム和文）を必ず含める。
- 和文本文の line-height は 1.7〜2.0。`palt`/`kern` を効かせる。
- テキストのコントラストは AA（4.5:1）。意味あるテキストの琥珀は `--safelight-strong`。
- タッチ要素は 44px。一次 CTA は塗りで明快に。
- 色・radius・（将来の）影は `@theme` トークン参照。

**Don't**
- 和文本文に line-height ≤ 1.2。和文に 0.3em の letter-spacing。
- 和文を 8〜10px に載せる。
- `bg`/低コントラスト色で行動要素（CTA・nav active）を弱くする。
- shadcn 既定の青紫トークンを再導入する。生 hex / 個別影の直書き。

---

## 8. レスポンシブ

- モバイルファースト。ブレークポイント `sm / md / lg / 2xl`。
- タッチ最小 **44px**（ハンバーガー `size-11`、Sheet nav リンク `py-2`、主要 CTA）。
- ヘッダーはモバイルで Sheet（右ドロワー）に集約。
- コンテナ上限: `@utility container` で `max-width: 90rem`（1440px）。超ワイドでの写真列・行長の間延びを防止（1440px 以下の一般的な画面は従来どおり）。
- 密度: 写真マソンリーは `sm:columns-2 md:columns-3 xl:columns-4`（md=768〜1023px の谷を解消し、最大幅 90rem 内で wide も密に）。コンテンツ系2カラム（画像+文・チャート）は窮屈化を避け据え置き。

---

## 9. エージェント指示（クイックリファレンス）

新規・変更時に必ず守ること:
1. 色・radius は `@theme` トークン（`var(--*)`）を参照。生 hex・shadcn 既定青紫は禁止。
2. 和文を含む要素は: フォールバック連鎖を壊さない / `font-feature-settings` を継承 / 最小 12px。装飾的 8〜10px は欧文・数値専用。
3. テキストの琥珀は `.text-safelight`（= `--safelight-strong`）。塗り・ドット・チャートは `bg-safelight` / `--safelight`。
4. 新規インタラクティブ要素は **focus-visible リング + タッチ 44px + `prefers-reduced-motion` ガード**を既定で備える。選択状態は `aria-pressed` / `aria-current`。
5. 見出しは `font-heading`、本文は既定（`font-sans`）、数値/EXIF は `font-mono`。

プロンプト例:
> 「kskphotos の DESIGN.md に従って、〔機能〕の UI を実装して。配色は @theme トークン、和文は palt/最小12px/AAコントラスト、タッチ44px、focus-visible と reduced-motion を必ず満たすこと。」
