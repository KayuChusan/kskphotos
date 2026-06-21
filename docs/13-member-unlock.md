# 13. 会員解錠（コレクション単位）

note メンバーシップの支援者向けに、特定コレクションを「解錠リンク」で限定公開する仕組み。note には会員判定 API が無いため、**限定記事に貼る解錠リンク（共有シークレット）**で橋渡しする。

## 全体像

```
note 限定記事の /u/<token> リンク
        │ クリック
        ▼
/u/[token] (route handler)
  - token をハッシュ化して UnlockToken を照合（失効・期限チェック）
  - 署名 Cookie（{コレクションID, トークンID} の配列）を発行
  - コレクションページへリダイレクト
        │
        ▼
コレクション/写真詳細/比較ページ（force-dynamic）
  - 署名 Cookie を検証（unlock-server）。トークンが DB で失効/期限切れなら無効
  - 解錠済み → EXIF・現像レシピを表示／未解錠 → 伏せる
```

## データモデル（`prisma/schema.prisma`）

| 追加 | 内容 |
|------|------|
| `Collection.isLocked` | true で会員限定（解錠まで EXIF・現像レシピ・(将来)マスク・高画素を出さない） |
| `UnlockToken` | 解錠トークン。`tokenHash` のみ保存（平文は発行時に一度だけ表示）。`collectionId` / `label` / `expiresAt` / `revoked` |
| `Photo.isLocked` | （未使用・廃止予定）旧・個別マスクフラグ。マスクはコレクション単位（`Collection.isLocked`）に統一したため不要。DB 列は残置 |
| `Photo.originalUrl` | 高画素オリジナル(4096px)の保存キー。**非公開バケット**に格納し公開 URL は持たない |

## 主要ファイル

| ファイル | 役割 |
|----------|------|
| `src/lib/unlock.ts` | 純粋関数：トークン生成/ハッシュ、Cookie 値の署名/検証（`{c,k}` 配列）、`addEntry`。テスト: `unlock.test.ts` |
| `src/lib/unlock-server.ts` | RSC から Cookie を読み、トークンID を DB と突き合わせて**失効・期限を毎回検証**（管理画面での失効が即時反映） |
| `src/lib/photo-visibility.ts` | `maskPhotoImage`（本画像 URL を取り除き blur+寸法のみ残す）／`maskForViewer`（写真ごとに「未解錠の会員限定コレクションか」を判定しマスク＋`masked`付与）／`excludeLockedPhotos`（トップ/dashboard/sitemap でロック写真を除外する where 断片）／`redactPhotoMeta`（EXIF だけ伏せる・現状未使用）。テスト: `photo-visibility.test.ts` |
| `src/components/gallery/locked-tile.tsx` | マスク表示タイル。`blurDataUrl` だけを描画（本画像を参照しない）＋鍵アイコン＋「会員限定」ラベル |
| `src/components/member-gate.tsx` | 会員限定機能のマスク表示＋note 誘導。`NOTE_MEMBERSHIP_URL`（note メンバーシップ URL を一元管理）／`NoteUnlockButton`（解錠ボタン）／`MemberGate`（「〜は会員限定です」＋ボタンの枠）。写真詳細・比較・コレクションの未解錠枠で使用 |
| `src/lib/storage.ts` | `saveOriginal`/`deleteOriginal`/`getOriginalSignedUrl`（本番=短期V4署名URL）/`readOriginal`（開発フォールバック）。非公開バケット `GCS_ORIGINALS_BUCKET` を使用 |
| `src/lib/images.ts` | `processOriginal`（4096px・高品質JPEG 生成） |
| `src/app/gallery/[id]/download/route.ts` | 高画素DL。会員限定×解錠済みのみ配信。本番は署名URLへリダイレクト、開発は直接ストリーム |
| `src/app/u/[token]/route.ts` | 解錠リンク。Cookie 発行 → コレクションへリダイレクト |
| `src/app/admin/collections/*` | 会員限定トグル＋解錠リンク発行/失効（管理画面） |

## 表示ポリシー

**会員＝有効な解錠トークンを1つでも持つ人**（`isMember()`＝`getUnlockedCollectionIds().length > 0`）。note メンバーシップの解錠リンクを踏めば会員。

**EXIF（撮影設定）は全写真で会員限定**：カメラ/レンズ/焦点/F値/SS/ISO/WB/測光/撮影日/現像レシピ/高画素/AUTHENTICITY のカメラ・日付。非会員には公開写真でも見せない。一方、**地図用の位置情報(lat/long/location)と撮影データ(集計ダッシュボード)は公開維持**（差別化機能を残すユーザー判断）。

| ページ | 非会員 | 会員 | レンダリング |
|--------|--------|------|-------------|
| `/gallery`・`/works`・`/collections`(一覧) | 公開写真=画像表示＋撮影設定だけ伏せる（`redactShootingMeta`）／会員限定ｺﾚｸｼｮﾝ=本画像もモザイク（`maskForViewer`） | 実画像＋EXIF | `force-dynamic` |
| 写真詳細/比較 | 撮影設定枠は `MemberGate`（note誘導）／会員限定ｺﾚｸｼｮﾝは本画像もモザイク・比較も会員限定 | 実画像＋EXIF＋現像＋高画素DL | `force-dynamic` |
| トップ`/`の写真表示（ヒーロー等） | 会員限定ｺﾚｸｼｮﾝは**除外**（`excludeLockedPhotos`） | （同左） | `force-dynamic` |
| トップ集計・`/dashboard` | **集計は公開**（会員写真も匿名化して算入） | （同左） | 静的/動的 |
| `/sitemap` | 会員限定ｺﾚｸｼｮﾝは除外 | （同左） | 静的 |

- **会員判定はグローバル**：有効トークンを持てば全写真の撮影設定＋会員限定ｺﾚｸｼｮﾝの本画像が見える（コレクションごとの個別解錠ではなく「会員かどうか」で判定）。
- **撮影データの集計は会員限定も件数に算入**（公開維持）。EXIF は本来 gated なので**個別の1枚に紐づかないよう匿名化**して算入：会員写真は `title`→「会員限定」、`location`/`imageUrl`/GPS をペイロードに出さず、チャート用は EXIF 数値のみ（匿名行）。`撮影場所数` はサーバー側 `distinct` 件数のみ（`ExifDashboard` の `locationCount`）。
- **本画像を一切出さない（会員限定ｺﾚｸｼｮﾝ）**：`maskForViewer`/`maskPhotoImage` で `imageUrl`/`thumbnailUrl`/`beforeUrl` と EXIF・GPS を除去。`LockedTile` は `blurDataUrl`（16px）のみ描画。
- **公開写真の撮影設定だけ伏せる**：`redactShootingMeta` は EXIF を null 化するが `imageUrl`/位置情報は残す（画像・地図は公開のまま、EXIF だけ会員限定）。
- **失効が即効く**：Cookie にトークンID を含め、表示時に DB で `revoked`/`expiresAt` を検証。管理画面で失効すると、既にクリック済みのブラウザも次アクセスで無効化される。
- **「非表示」ではなく「会員限定」表示で note 誘導**：未解錠の会員機能（EXIF・現像レシピ・高画素DL・本画像）は隠さず `MemberGate`/`LockedTile` で「会員限定」と見せ、`NoteUnlockButton`（`NOTE_MEMBERSHIP_URL`）で note メンバーシップ参加へ誘導する。一覧のマスクタイルはクリックで写真詳細（＝誘導枠）へ繋がる。note URL は `member-gate.tsx` の定数で一元管理。

## 運用

1. `/admin/collections` で対象コレクションを「会員限定」に。
2. 「新しい解錠リンクを発行」→ 表示された `/u/<token>` を note の限定記事に貼る（発行時のみ表示・再表示不可）。
3. 漏えい時は管理画面で「失効」。新しいリンクを発行して貼り替える。

## フェーズ

- **Phase 1（実装済み）**：解錠基盤＋ EXIF・現像レシピの会員限定表示＋公開一覧からの除外。
- **Phase 2（実装済み）**：写真のマスク。未解錠の会員限定コレクションを `maskPhotoImage`＋`LockedTile` でぼかし、本画像を一切出さない（詳細・比較・OGP）。
- **Phase 3（実装済み）**：高画素ダウンロード。アップロード時に 4096px オリジナルを**非公開バケット**へ保存し、会員限定×解錠済みのときだけ `/gallery/[id]/download` が短期署名 URL を発行して配信。
- **Phase 4（実装済み）**：公開一覧でのモザイク表示。会員写真を「除外」から「モザイク表示」に変更（`/gallery`・`/works`・`/collections` を `force-dynamic` 化、未解錠は `maskForViewer` でぼかし、解錠済みは実画像）。トップ・dashboard・sitemap は引き続き除外。マスクをコレクション単位に統一し旧 `Photo.isLocked` トグルは廃止。詳細は「表示ポリシー」。

## 高画素ダウンロード（Phase 3）

- **保存先は非公開バケット**：公開 `photos` バケットは `allUsers` 読み取りで全公開のため、原本は別の非公開バケット `${project}-originals`（allUsers 無し）に保存。`Photo.originalUrl` は公開 URL ではなく保存キー。
- **配信は短期署名 URL**：解錠確認後、サーバーが V4 署名 URL（5分）を発行しリダイレクト。転送は GCS が直接負担し Cloud Run を経由しない。署名は秘密鍵を使わず IAM SignBlob（SA に `roles/iam.serviceAccountTokenCreator` を自己付与）。
- **特典の範囲**：高画素 DL は会員限定（`isLocked`）コレクション×解錠済みのみ。公開コレクションや未解錠は 404/403 で原本を一切露出しない。
- **解像度/コスト**：4096px・高品質 JPEG（1枚2〜4MB）。フル解像度オリジナルより容量・転送コストを約1/10に抑える。
- **既存写真**：`originalUrl` が無い既存写真は DL ボタン非表示（再アップロードで付与）。

### デプロイ手順（重要）

新バケット・署名権限・env を本番へ反映するため、コードデプロイの前に Terraform を**ターゲット指定**で apply（全 apply は保留中の CDN を作るため不可）。

```
cd terraform
terraform apply \
  -target=module.storage.google_storage_bucket.originals \
  -target=module.storage.google_storage_bucket_iam_member.originals_cloud_run_access \
  -target=module.iam.google_service_account_iam_member.cloud_run_sign_blob \
  -target=module.cloud_run
```

`module.cloud_run` の apply で `GCS_ORIGINALS_BUCKET` env が注入される。未設定のままだとアップロード原本がインスタンスの一時ディスク（非永続）に書かれるため、apply 後に運用開始すること。
