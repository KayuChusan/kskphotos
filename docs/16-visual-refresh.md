# 16. ビジュアル刷新（FRAME＋二灯化＋図解）

## このドキュメントの目的

「配色が単調／クリエイティブさ・モダンさが足りない／図解で分かりやすく」というフィードバックに対する、サイト全体のビジュアル刷新の設計判断と実装範囲を記録する。

## 背景・方針

ultracode（マルチエージェント）で方向を多角検討し統合。採用は **「FRAME（計器としての装丁）＋暗室バンドの譜面＋二灯化（琥珀×現像液シアン）＋図解」**。ブランドの芯（暗室×印画紙・静謐・写真主役）は壊さず拡張。**WCAG AA・写真主役・reduced-motion・和文12px/OS和文フォント**は厳守。

## 実装範囲

### 1. 配色トークン（`app/src/app/globals.css`）
- 本文 **3階調**（`--foreground` / `--foreground-soft` / `--muted-foreground`）、面の塗り分け `--surface-sink` / `--card-warm`。
- 署名ユーティリティ：`.frame`（常時ファインダー額縁）/ `.darkroom`（暗室バンド・前景トークン局所反転）/ `.safelight-wash`・`.coolant-wash`（暖/冷のにじみ）/ `.develop-text`（見出しの軽量現像）。
- **第2アクセント＝現像液シアン**：`--coolant`(塗り) / `--coolant-strong`(テキスト・`.text-coolant`/`.link-cool`) / `--coolant-wash` / `--coolant-line` / `--tide` / `--grad-warm`/`--grad-deep`。チャートを温度順（琥珀→黄→青緑→シアン）に。`aurora` の片層を極淡シアンにして背景に温度差。
- 詳細トークン値・AA比・運用規律は `DESIGN.md` §2/§7 を正とする。`:root` / `.dark` / `.darkroom` の3箇所同期が必須。

### 2. コンポーネント
- `app/src/components/ui/section-mark.tsx`：大判フィルムカウンター＋計器ヘッダ（セクション eyebrow を置換）。
- `app/src/components/diagram/flow-diagram.tsx`：工程フロー図。過程ノード=シアン／到達点=琥珀、ノード間を温度グラデ線で接続。和文は `JaText`、動きなし（reduced-motion 安全）。

### 3. ページ適用
- **トップ `page.tsx`**：面のリズム（生成り→沈め＋冷wash→生成り→暗室バンド＋暖wash＋グレイン→生成り）、SectionMark、写真枠の `.frame`、card-warm、タグライン/統計の `.develop`/`.develop-text`。
- **`/guide`**：ワンストップの価値を `FlowDiagram`（撮影→写真素材→Web→運用）に。
- **`/dashboard`（EXIFチャート）**：系列を二灯（琥珀=最重要1点／シアン=データ系列）＋温度順パレットに。
- 段階導入：services/works/about/gallery への SectionMark・frame・3階調・追加図（Stepper/RangeBars/PillarTrio）展開は次フェーズ。

## 検証

- `npx tsc --noEmit` / `npm run lint` / `npm --prefix app run test:run`（74）。
- dev（:3001）でトップ・/guide・/dashboard のスクショ確認。**主要な前景×背景・アクセントの AA**（DESIGN.md の実測比）。`.darkroom` 面で前景が暗室値を継承しているか。
- コミット前に Codex レビュー。PR→CI→デプロイ後に本番で表示・AA再確認。

## 注意

- ローカル dev DB は EXIF データが空だとチャートが空表示になる（本番DBにはデータあり）。`isHero` 等の列が無いと `page.tsx` が描画前にクラッシュするため、ローカルは `prisma db push` でスキーマ同期が必要。
- 冷色は「過程・参照・図・チャート」限定の従色。本文・大面積・写真への冷色塗りは禁止（DESIGN.md §7）。

## 追補：ロゴ整合のブランド二刀流（暖×ロゴ青／明朝×等幅）

新ブランドロゴ（濃紺＋エレクトリックブルー hue262＋幾何学）に合わせ、世界観を壊さずロゴをサイトの「夜側／テック側」に溶かす調整。**支配色のアンバーは不変＝大半のページは無風**。

- **色の二刀流**：第2アクセント（旧シアン hue210）を**ロゴ純青 hue262**へ再調律。青は3役に分割＝テキスト `coolant-strong 0.46 0.13 262`（cream 6.5:1）／塗り `coolant 0.58 0.16 262`／ロゴ純青 `--brand-blue 0.6 0.19 262`（大要素・マーク限定）。暖=写真・行動／青=Web・IT・データ。
- **濃紺バンド `.bluehour`** を新設（`.darkroom` の暖色は写真用として温存）。home 04「ささえる（IT Support）」をこの濃紺バンド化し、ターミナルの `$`/●/カーソルを青に（＝エンジニアリングの声）。全トークンを局所補完しAA死守。
- **02 写真は暖wash／04 IT は濃紺**に整理（青の意味＝Web・ITに合わせ wash の温度配置を是正）。チャートは `chart-1` 琥珀＝最重要＋`chart-2` 青＝データ系列。
- **二声（書体）**：色軸とは別軸で「明朝(Fraunces)＝人間・編集／等幅(Geist Mono)＝機械・データ」。新フォント追加なし。等幅は欧文/数字・eyebrow・EXIF・ターミナル限定（和文見出し/本文に等幅は不可）。
- **ヒーロー**は写真層=黒のまま、スクロール被せオーバーレイのみ濃紺へ。ダークモード基調は暖色維持（写真面を冷やさない）。
- 方向性は **ultracode 5レンズ＋Codex** で検証（GO（調整付き）。AA・3役分割・`.darkroom`非上書き・二声の人間/機械軸化・段階導入を反映）。
