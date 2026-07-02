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

## 追補2：「写したあとが、強い。」リブランド（トップ全面＋デザイン基盤）

外部のクリエイティブ提案（広告ポスター型モック）を起点に、**模写ではなく「本物が動いている机の上」**という独自テーゼで再設計。密度は装飾でなく実物（実写真・実EXIF・実ターミナル・実価格）で出し、筆致・テープ・トリムマーク＝手の痕跡、鋭利なステートメント・タイポとターミナル＝機械の規律、の衝突で「写したあとが、強い。」を体現する。

**変更の骨子**（詳細は DESIGN.md §1〜3）:
- コピー体系: メイン「写したあとが、強い。」／行動原理「撮る、つくる、ささえる。」（RECレッド筆致下線）／説明「写真で惹きつけ、Webで受け止め、運用で止めない。」
- 新トークン: `--ink`（ステートメントの墨）／`--rec`・`--rec-strong`（RECレッド。点限定・小テキストはstrong）／`--film`（フィルムイエロー・テープ面）
- 新書体: `.statement-jp` = **Statement JP**（Noto Sans JP Black のサブセット self-host・約19KB）。三声=ステートメント（断言）/明朝（編集）/等幅（機械）
- ヒーロー: 暗い写真フルブリード → **明るい生成り×左巨大ステートメント×右「机の上」コラージュ**（主写真+銀塩プリント+設計図（青筆致）+ブラウザ+ターミナル+テープ+右端フィルムストリップ+赤トリムマーク）。下端にパイプライン帯
- トップ構成: Hero → 01 Concept（終わらない三連）→ 02 Workflow（赤トリム番号+アイコンパイプライン）→ 03 Photography（フィルムストリップ）→ 04 Web Production（dawn）→ 05 IT Support（濃紺コンソール**カード**）→ 06 Price（実価格3カード）→ Contact（濃紺バンド+無料バッジ+筆致縁→フッター地続き）
- `.bluehour` は「全幅バンド1枚（Contact→フッター）＋コンソールカード少量」の2形態に運用変更
- 新規コンポーネント: `home/brush-stroke.tsx`（feTurbulence の筆致。装飾は意味のある場所に少量）

**Statement JP サブセットの再生成手順**（決め文句を追加・変更したら必ず実行）:
```bash
cd app
TEXT='（DESIGN.md §1 のコピー体系の全文をここに連結）'
ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$TEXT")
curl -s "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=${ENC}&display=swap" \
  -H "User-Agent: Mozilla/5.0 ... Chrome/126.0 Safari/537.36" # woff2対応UA必須
# 返ってきた CSS 中の fonts.gstatic.com URL を public/fonts/statement-jp.woff2 に保存
```
unicode-range は付けない（サブセット外の文字はグリフ単位で OS 極太ゴシックにフォールバック）。

**検証**: tsc / lint / test(82) / build 通過。dev(:3001) でデスクトップ(1470)・モバイル(390) スクショ確認（ヒーロー・Workflow・コンソール・Price・CTA・フッター）。和文ボタンは12px に是正。REC 小テキストは `--rec-strong`（生成り上 約4.9:1）。

## 追補3：モバイル監査・dawn 撤去・モーション体系刷新

ユーザー指摘（モバイル視認性／04 の水色の説明責任／ヘッダー濃紺の説明責任／アニメーションが古い）への対応。

- **04 の水色（dawn）撤去**: 旧「印画紙×セーフライト」体系の温度橋渡しの遺物で、新ブランドでは説明責任を果たせないため、トップから撤去（面はアイボリー統一・青は設計図/コンソール等の「モノ」が持つ）。`.dawn` は下層互換のため非推奨で残置。
- **ヘッダーの色の原則**: 背面の面に追従する色ガラス（明るい面=生成り、暗い面=濃紺）。濃紺になるのは濃紺セクション（Contact帯・フッター）の上だけ。ロゴ自体はブランド濃紺（正色）。
- **モバイル簡素化**: コラージュは <sm で銀塩プリント・設計図を隠し（縮小コピーにしない）、主写真は全幅・ブラウザ/ターミナルを再配置。和文ボタン12px。全セクションを 390px 実レンダリングで監査済み。
- **モーション体系「机の上が動く」**（スクロール駆動・reduced-motion/@supports ガード付き）:
  `.reveal-sweep`（断言の刷り出し・旧 develop-text 置換）/ `.type-line`（ターミナルのタイプ打ち・scroll-scrub）/ `.brush-on`（筆致の刷き込み）/ `.marquee`（パイプラインの無限送り）/ `.film-drift`（フィルムの微速ドリフト）/ ヒーローのレイヤー視差（framer useScroll・紙片ごとに速度差）。
- **レスポンシブQAハーネス**: `public/dev-viewport.html`（390/768 を並列表示）。dev のみ `frame-ancestors 'self'`/`X-Frame-Options: SAMEORIGIN` で同一オリジン iframe を許可（本番は none/DENY のまま＝ハーネスは本番では機能しない・意図的）。

## 追補4：/lab — 生きているポスター（実験場）

制約（DESIGN.md 運用規律）を外した実験場として `/lab` を新設（noindex・サンドボックス）。広告ポスターのブリーフを「動くエディトリアル誌面」として翻訳した。

- **コンセプト**: 生きているポスター — 絞りが開き、シャッターが落ち、フィルムが送られ、誌面が組み上がる。構図A（巨大タイポ×実写の衝突）＋E（色面）＋F（反復）をスクロールの時間軸で連結。
- **モーション語彙**: アパーチャ・オープニング（clip-path circle・タイムアウト保険付き）／グリフマスク（SVG clipPath で巨大「写」の字に実写を流し込み・見当ズレの青アウトライン）／シャッター・スクラブ（useScroll でピント送り blur→シャッター幕→プリントが積まれる）／フィルムアドバンス（300vh ピン留め・縦→横送りスクラブ・3パネル色面）／カラースラム（電気青の色面×逆走アウトライン・マーキー×フィルムイエローのステッカーCTA）／フォーカスブラケットのカスタムカーソル（pointer:fine のみ・DOM直書きで再レンダー無し）。
- **堅牢化原則の継承**: アニメ不発でも必ず見える（イントロは setTimeout 保険・文字 opacity 常時1・reduced-motion は静的レイアウトへフォールバック）。
- 実装: `app/src/app/lab/page.tsx`（server・写真8枚取得・robots noindex）＋ `lab-experience.tsx`（client）。本編へ昇格する場合は DESIGN.md へ翻訳してから。
