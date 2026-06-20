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
| `Photo.isLocked` | 未解錠時にマスク（ぼかし）する写真。管理画面の写真テーブルでトグル |
| `Photo.originalUrl` | 高画素オリジナル(4096px)の保存キー。**非公開バケット**に格納し公開 URL は持たない |

## 主要ファイル

| ファイル | 役割 |
|----------|------|
| `src/lib/unlock.ts` | 純粋関数：トークン生成/ハッシュ、Cookie 値の署名/検証（`{c,k}` 配列）、`addEntry`。テスト: `unlock.test.ts` |
| `src/lib/unlock-server.ts` | RSC から Cookie を読み、トークンID を DB と突き合わせて**失効・期限を毎回検証**（管理画面での失効が即時反映） |
| `src/lib/photo-visibility.ts` | `redactPhotoMeta`（EXIF・現像・GPS を伏せる）／`maskPhotoImage`（本画像 URL も取り除き blur+寸法のみ残す）／`excludeLockedPhotos`（公開一覧からロック写真を除外する where 断片）。テスト: `photo-visibility.test.ts` |
| `src/components/gallery/locked-tile.tsx` | マスク表示タイル。`blurDataUrl` だけを描画（本画像を参照しない）＋鍵アイコン＋「会員限定」ラベル |
| `src/lib/storage.ts` | `saveOriginal`/`deleteOriginal`/`getOriginalSignedUrl`（本番=短期V4署名URL）/`readOriginal`（開発フォールバック）。非公開バケット `GCS_ORIGINALS_BUCKET` を使用 |
| `src/lib/images.ts` | `processOriginal`（4096px・高品質JPEG 生成） |
| `src/app/gallery/[id]/download/route.ts` | 高画素DL。会員限定×解錠済みのみ配信。本番は署名URLへリダイレクト、開発は直接ストリーム |
| `src/app/u/[token]/route.ts` | 解錠リンク。Cookie 発行 → コレクションへリダイレクト |
| `src/app/admin/collections/*` | 会員限定トグル＋解錠リンク発行/失効（管理画面） |

## 漏えい対策（重要）

- **公開一覧から除外**：`/gallery`・`/dashboard`・トップ・`/works`・`sitemap`・`/collections` のクエリに `excludeLockedPhotos`／`isLocked:false` を付与し、ロック中コレクションの写真・コレクションを出さない（会員写真は公開ファイアホースに載せない）。
- **個別ページで伏せる**：コレクション/写真詳細/比較は未解錠なら EXIF・現像レシピを非表示、`generateMetadata` も EXIF を出さず `noindex`、一覧カード/ライトボックスへ渡す写真は `redactPhotoMeta` で伏せる。
- **マスク写真は本画像を出さない**：`isLocked` 写真は未解錠時 `maskPhotoImage` で `imageUrl`/`thumbnailUrl`/`beforeUrl` を除去し、`LockedTile` が `blurDataUrl`（16px）だけを描画。RSC ペイロード・OGP のいずれにも本画像 URL を載せない（`generateMetadata` の OG 画像も `isLocked` なら省略）。比較ページもスライダーを出さずマスクタイルに差し替え。
- **失効が即効く**：Cookie にトークンID を含め、表示時に DB で `revoked`/`expiresAt` を検証。管理画面で失効すると、既にクリック済みのブラウザも次アクセスで無効化される。
- 解錠対象ページは `force-dynamic`（Cookie をリクエストごとに読むため）。公開一覧は除外フィルタで対応するので静的のまま。

## 運用

1. `/admin/collections` で対象コレクションを「会員限定」に。
2. 「新しい解錠リンクを発行」→ 表示された `/u/<token>` を note の限定記事に貼る（発行時のみ表示・再表示不可）。
3. 漏えい時は管理画面で「失効」。新しいリンクを発行して貼り替える。

## フェーズ

- **Phase 1（実装済み）**：解錠基盤＋ EXIF・現像レシピの会員限定表示＋公開一覧からの除外。
- **Phase 2（実装済み）**：一部写真のマスク。`Photo.isLocked` 写真を未解錠時に `maskPhotoImage`＋`LockedTile` でぼかし、本画像を一切出さない（一覧・詳細・比較・OGP）。管理画面の写真テーブルにロックトグル追加。
- **Phase 3（実装済み）**：高画素ダウンロード。アップロード時に 4096px オリジナルを**非公開バケット**へ保存し、会員限定×解錠済みのときだけ `/gallery/[id]/download` が短期署名 URL を発行して配信。

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
