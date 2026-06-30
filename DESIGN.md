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
| ファインダー | 写真枠のコーナーブラケット。`.frame` は常時うっすら→hover/focusで点灯（`.viewfinder` はhover専用の旧版） | `.frame` / `.viewfinder` |
| 現像 | スクロール進入で像が結ぶ（blur→鮮明）。見出し用の軽量版は `.develop-text`（blur+不透明度のみ） | `.develop` / `.develop-text`（scroll-driven） |
| 絞り羽根 | ライトボックスを開く円形ワイプ | `.lightbox-iris` |
| 暗室バンド | 前景/背景トークンを局所反転する見せ場セクション（暖色＝**写真用**の暗面） | `.darkroom`（＋`grain`） |
| ブルーアワー帯 | ロゴ土台色の濃紺バンド（**Web/IT・機械の暗面**。薄明＝温→冷の橋渡し） | `.bluehour`（＋`grain`） |
| ブランド青 | ロゴ差し色のエレクトリックブルー（第2アクセント／Web・IT・データ） | `--coolant` 系 / `--brand-blue` |
| セーフライトの面 | アクセントを点→面へ昇華する極薄の琥珀にじみ（非テキスト） | `.safelight-wash` |
| HUD / EXIF / 計器ヘッダ | 計器風のモノスペース表記。セクション見出しは大判フィルムカウンター | `.eyebrow` / `.exif-text` / `SectionMark` |

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

### 刷新トークン（FRAME＋二灯化）
本文は色でなく**3階調**で表情を出す：`--foreground`(見出し) / `--foreground-soft`(導入・リード, light 8.6:1) / `--muted-foreground`(補助)。面の塗り分けは `--surface-sink`(沈め) / `--card-warm`(現像温度カード)。

**第2アクセント＝ブランド・エレクトリックブルー（ロゴ差し色 hue262）**。暖色の主灯（琥珀）に対し、青を「Web/IT・過程・参照・図・チャート」に限る**従色**として迎える。＝**ブランドの二面性（撮る＝暖／つくる・ささえる＝青）を色でエンコード**。シアン(hue210)から**ロゴ純青(hue262)**へ再調律。

**青は3役に分ける**（純青をテキストに流用すると cream 上で約3.8:1＝AA不合格になるため）:

| トークン | ライト | ダーク | 役割・AA |
|---|---|---|---|
| `--coolant-strong` | `0.46 0.13 262` | `0.74 0.15 262` | **テキスト/参照リンク**（cream 上 約6.5:1）。`.text-coolant`/`.link-cool`（下線併用）。彩度は0.14以下に抑え“主役は琥珀”の階層を守る |
| `--coolant` | `0.58 0.16 262` | `0.74 0.15 262` | 塗り/ドット/図ノード/チャート（**非テキスト限定**） |
| `--coolant-wash` | `…/0.08` | `…/0.12` | `.coolant-wash`（面のにじみ） |
| `--coolant-line` | `0.6 0.12 262` | `0.58 0.1 262` | 図の罫・border代替（非テキスト） |
| `--brand-blue` | `0.6 0.19 262` | `0.7 0.18 262` | **ロゴ純青**。ロゴ本体・border・≥24px大要素・アイコン塗り・署名青のみ。**cream 上の本文/小文字に使わない** |
| `--tide` | `0.55 0.07 160` | `0.7 0.09 160` | 橋渡しの青緑（グラデ中継・チャート中間系列） |

**濃紺バンド（ロゴ土台色）**: `.darkroom`（暖色エスプレッソ＝**写真用の暗面**）は温存し、Web/IT の暗面は別ユーティリティ **`.bluehour`**（背景 `0.16 0.045 262`）として新設。全トークンを局所補完（muted/secondary/accent/input/ring/popover/chart 含む。ライト値漏れ＝AA破綻を防ぐ）。内部の灯は濃紺面で AA が出る明度へ持ち上げ（青テキスト `0.7 0.16 262`≒7.2:1／琥珀テキスト `0.7 0.14 62`≒7.6:1）。**1ページ1枚厳守**。

**運用規律（点8割・有彩面積15%以内・琥珀:青≧4:1）**:
- 行動の主導線（CTA塗り・nav active・SectionMark番号）＝**琥珀**のまま。Web/IT・参照・過程・データ＝**青**（住み分け：暖=写真/行動／青=Web・IT/参照）。
- **青の許可域**: ロゴ/署名青、Web/IT セクション（home の `.bluehour` 帯・つくる/ささえる）、`flow-diagram`、`works`、`exif-charts` のデータ系列、フッター/eyebrow の IT ラベル。
- **青の禁止域**: 写真カード/`.frame`境界、ライトボックス・クローム、ビフォーアフターのハンドル＆分割線、地図マーカー、サムネ上の EXIF 値、**CTA塗り（`--primary` は暖色維持）**。写真主導ページ（gallery/collections/about）では青はデータ表示に従属。
- `.safelight-wash`(暖) と `.coolant-wash`(青) は別セクションに交互配置。**写真セクションは暖wash**、Web/IT セクションは青/濃紺。同一セクションで両方禁止・1セクション1wash。
- チャートは色相識別（`--chart-1` 琥珀＝最重要1点／`--chart-2` 青＝データ系列）＋**ラベル/マーカー形状併記**（色覚非依存。amberと青は輝度が近く色相依存になるため形状/直接ラベルを必須）。
- **グラデ/wash 上にテキストを載せない**（テキストは常に単色トークン上でAA判定）。
- `.darkroom`/`.bluehour` は前景・safelight・coolant トークンも局所再定義し、内部の図/チャートが暗面値を継承する（前景沈み事故の防止＝AA死守の要）。

---

## 3. タイポグラフィ規則【和文重視・最重要】

### 3.1 役割別書体（`layout.tsx` / next/font ＋ OS フォールバック）
和文 Web フォントは表示速度のため**廃止**し、和文は OS 標準にフォールバックする（[`docs/01`の経緯] / PR #47）。

| 役割 | 書体 | 変数・適用 |
|------|------|------|
| 和文 本文 | OS ゴシック（ヒラギノ角ゴ / Yu Gothic / Noto Sans JP） | `--font-sans` |
| 和文 見出し | OS 明朝（ヒラギノ明朝 / Yu Mincho / Noto Serif） | `--font-heading` |
| 和文 決め文句（ヒーロー） | Shippori Mincho（使用文字だけ self-host・約2.3KB） | `.tagline-jp` |
| 欧文 ディスプレイ | Fraunces（ソフトセリフ） | `--font-display` |
| 欧文 本文 | Geist | `--font-geist-sans` |
| 数値・HUD | Geist Mono | `--font-geist-mono` |

**二声（書体の軸＝人間/機械）**: 色の軸（暖=写真／青=Web・IT）とは**別軸**として、書体で「人間・編集 vs 機械・データ」を表す。新フォントは足さない（和文Webフォント不採用＝パフォーマンス維持）。
- **明朝（Fraunces＋OS明朝）＝人間・編集の声**：見出し・作品・物語（gallery/about/works/写真セクション）。
- **等幅（Geist Mono）＝機械・データの声**：eyebrow・EXIF・数値・ターミナル/IT ラベル（`.bluehour` 帯の `$` プロンプト等）。**用途上限＝欧文/数字主体・概ね ≤13px**。**和文見出し・和文本文に等幅を適用しない**（字幅不揃い・行間1.7〜2.0 を満たせず破綻）。IT 側の和文見出しは引き続き明朝＋mono eyebrow＋青の面で表現。

### 3.2 フォントスタック（必須: 欧文→システム和文→generic）
`globals.css` の `@theme` で合成。**システム和文フォールバックを必ず含める**（和文が崩れない）。
**本文はゴシック、見出しは明朝**で和文を出し分ける（見出しを上質に・本文は可読性優先）:
```css
--font-sans: var(--font-geist-sans),
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", "Meiryo", system-ui, sans-serif;
--font-heading: var(--font-display),
  "Hiragino Mincho ProN", "Hiragino Mincho Pro", "YuMincho", "Yu Mincho", "Noto Serif CJK JP", "Noto Serif JP", serif;
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

### 3.7 和文の改行（文節折り）【重要・再発防止】
日本語はデフォルトでほぼ任意の文字位置で改行され、狭い幅（カード・モバイル）では「ポートフォリオ」等のカタカナ語や複合語が**文節の途中で割れる**。CSS の `word-break: auto-phrase` は Chromium 限定で **iOS Safari では効かない**ため、CSS だけに頼らない。

- **カード・ラベルなど狭い幅で折り返す和文本文は `JaText`（`@/components/ui/ja-text`）で囲む**。BudouX で文節分割し、境界に `<wbr>` を挿入したうえで `break-keep`（`word-break: keep-all`）を当て、**文節境界でのみ改行**させる（全ブラウザで有効・サーバー側処理でクライアントJS増なし）。
  - 例: `<p className="text-xs ..."><JaText>{body}</JaText></p>`
- 新規で和文の説明文・特徴リスト・カード本文を追加するときは原則 `JaText` を通す。長い英数字（URL・レンズ名）は body の `overflow-wrap: anywhere` で従来どおり折れる。
- 見出し(h1/h2…)は `text-wrap: balance/pretty` 済みのため通常は不要。固有名詞が割れて気になる短い見出し・ラベルのみ `JaText` を検討。

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
- shadcn 既定の**無彩青紫**トークンを再導入する。生 hex / 個別影の直書き。
  - ※ ブランド青（`--coolant` 系＝ロゴ差し色 hue262・Web/IT/参照/データに限定）は**ブランドの正色**として可（この禁止対象は shadcn 既定の無彩青紫であって coolant ではない）。
- **ロゴ純青 `--brand-blue`（0.6 0.19 262）を cream 上の本文/小文字に使う**（約3.8:1でAA不合格）。本文の青は必ず `--coolant-strong`。
- 写真主導ページ・写真サムネ隣接・ライトボックス・地図マーカー・ビフォーアフターのハンドルに**青の面/罫**を置く（青は §2「禁止域」参照）。**CTA塗り（`--primary`）の色を変える**（暖色維持）。
- 本文・長文や大面積背景・写真オーバーレイに**冷色の塗り**を載せる。グラデ/wash 上にテキストを置く。`.bluehour`/`.darkroom` を1ページ2枚以上置く。

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
