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
| `Photo.isLocked` | （Phase 2）未解錠時にマスクする写真 |
| `Photo.originalUrl` | （Phase 3）高画素ダウンロード用 |

## 主要ファイル

| ファイル | 役割 |
|----------|------|
| `src/lib/unlock.ts` | 純粋関数：トークン生成/ハッシュ、Cookie 値の署名/検証（`{c,k}` 配列）、`addEntry`。テスト: `unlock.test.ts` |
| `src/lib/unlock-server.ts` | RSC から Cookie を読み、トークンID を DB と突き合わせて**失効・期限を毎回検証**（管理画面での失効が即時反映） |
| `src/lib/photo-visibility.ts` | `redactPhotoMeta`（EXIF・現像・GPS を伏せる）／`excludeLockedPhotos`（公開一覧からロック写真を除外する where 断片） |
| `src/app/u/[token]/route.ts` | 解錠リンク。Cookie 発行 → コレクションへリダイレクト |
| `src/app/admin/collections/*` | 会員限定トグル＋解錠リンク発行/失効（管理画面） |

## 漏えい対策（重要）

- **公開一覧から除外**：`/gallery`・`/dashboard`・トップ・`/works`・`sitemap`・`/collections` のクエリに `excludeLockedPhotos`／`isLocked:false` を付与し、ロック中コレクションの写真・コレクションを出さない（会員写真は公開ファイアホースに載せない）。
- **個別ページで伏せる**：コレクション/写真詳細/比較は未解錠なら EXIF・現像レシピを非表示、`generateMetadata` も EXIF を出さず `noindex`、一覧カード/ライトボックスへ渡す写真は `redactPhotoMeta` で伏せる。
- **失効が即効く**：Cookie にトークンID を含め、表示時に DB で `revoked`/`expiresAt` を検証。管理画面で失効すると、既にクリック済みのブラウザも次アクセスで無効化される。
- 解錠対象ページは `force-dynamic`（Cookie をリクエストごとに読むため）。公開一覧は除外フィルタで対応するので静的のまま。

## 運用

1. `/admin/collections` で対象コレクションを「会員限定」に。
2. 「新しい解錠リンクを発行」→ 表示された `/u/<token>` を note の限定記事に貼る（発行時のみ表示・再表示不可）。
3. 漏えい時は管理画面で「失効」。新しいリンクを発行して貼り替える。

## フェーズ

- **Phase 1（実装済み）**：解錠基盤＋ EXIF・現像レシピの会員限定表示＋公開一覧からの除外。
- **Phase 2**：一部写真のマスク（未解錠はぼかし、サーバー側で本画像を出し分け）。
- **Phase 3**：高画素ダウンロード（`originalUrl` 保存＋解錠ゲート付き DL ルート）。GCS 容量・配信コストは [02-gcp-terraform.md](./02-gcp-terraform.md) のコスト方針を参照。
