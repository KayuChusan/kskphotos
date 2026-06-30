# 19. SEO・アクセス解析・セキュリティ・運営者表示の強化

商用サイトとしての信頼性・集客・安全性を底上げするための横断改修。撮る/つくる/ささえるの
支配的トーンや AA・パフォーマンスは維持したまま、土台を固める。

## 1. 運営者表示・申込トーン（法務・信頼性）

本サイトは**サイト内で受注を確定しない**（メール・相談フォーム経由で個別に見積→打ち合わせ→
成約）。そのため特定商取引法（通信販売）の全項目表記は必須ではない。一方で次を整えた。

| 項目 | 内容 |
|------|------|
| フッター運営者表示 | 事業者名（KSK Works）・拠点（神奈川／全国出張対応）・連絡先（info@kskworks.jp）を最小限で明示。住所・電話・代表者実名は出さず連絡導線に集約 |
| フッター導線 | 最下部バーに「お問い合わせ（/contact）」「プライバシーポリシー」を併記 |
| 申込→相談トーン | `/booking` の文言を「依頼確定」と読めない相談トーンへ（ボタン＝「この内容で相談する」、成功＝「ご相談を受け付けました」、サブコピーに「お見積り・お打ち合わせのうえで撮影が確定します」）。これにより通信販売の「申込受付」該当性を避ける |

> 注: 将来オンサイトで料金確定・前金決済等を導入する場合は、特商法 通信販売の全項目表記が
> 別途必要になる。

## 2. アクセス解析（Google Analytics 4）

`src/components/analytics/google-analytics.tsx`（サーバーコンポーネント）で env ゲート実装。

- `NEXT_PUBLIC_GA_ID` が空（ローカル/開発）または `NODE_ENV !== production` のとき**何も出力しない**。
- `next/script` の `afterInteractive` で `gtag.js` を読み込み、LCP を阻害しない（`@next/third-parties` は未導入のため不使用）。
- `NEXT_PUBLIC_*` は**ビルド時にインライン化**されるため、本番では**ビルド時**に値を渡す必要がある。
  - `app/Dockerfile`: `ARG NEXT_PUBLIC_GA_ID` を追加。
  - `.github/workflows/deploy.yml`: `--build-arg NEXT_PUBLIC_GA_ID="${{ vars.NEXT_PUBLIC_GA_ID }}"`。
  - **有効化手順**: GA4 プロパティを作成 → 測定ID（`G-XXXXXXXXXX`）を GitHub リポジトリの
    Actions 変数 `NEXT_PUBLIC_GA_ID` に設定 → 次回デプロイで反映。
- 法令対応（`/privacy` 第6条）: 改正電気通信事業法の**外部送信規律**に基づき「送信先／送信情報／
  利用目的」を公表。Cookie・GA 利用とオプトアウト導線を明記。
- 同意バナー（CMP）は今回スコープ外（公表で外部送信規律は満たす。EU/GDPR 対象なら別途検討）。

## 3. SEO 仕上げ（構造化データ）

canonical / OGP / metadataBase は既に完備（`src/lib/seo.ts` の `pageSeo`）。今回は JSON-LD を拡充。

| 追加 | 場所 |
|------|------|
| `@graph`（ProfessionalService + WebSite を `@id` で連結） | `src/lib/structured-data.ts` → `layout.tsx` |
| Person（フォトグラファー） | `/about` |
| Service + Offer（最低価格 ¥11,000） | `/services` |
| BreadcrumbList | `/about`・`/services`・`/gallery/[id]`（会員限定=noindex は除外） |
| twitter:image | `src/app/twitter-image.tsx`（opengraph-image を再利用） |

- 注入は再利用コンポーネント `src/components/json-ld.tsx`（`<script type="application/ld+json">`）。
- ビルダーは依存追加なし（schema-dts 不使用、プレーンオブジェクト）。

## 4. セキュリティ

監査の結果、admin 認可（middleware＋layout＋各 action/API の `auth()`）・会員解錠トークン・
シークレット管理は健全。実ギャップ2点を是正した。

| 対応 | 内容 |
|------|------|
| HTTP セキュリティヘッダ | `next.config.ts` の `headers()` で全ルートに付与。`X-Frame-Options: DENY`／`X-Content-Type-Options: nosniff`／`Referrer-Policy`／`Permissions-Policy`／`Strict-Transport-Security`／`Content-Security-Policy`。CSP は暫定で `'unsafe-inline'` 許可（インライン JSON-LD・Next ランタイム・framer を壊さないため）＋ GA4 ドメインを許可。将来 nonce 化で `'unsafe-inline'` を外す余地を残す |
| 公開フォームのスパム対策 | `/contact`・`/booking` にハニーポット（隠し `company` フィールド）＋ IP 単位の簡易レート制限（`src/lib/rate-limit.ts`、5回/60秒）。DB 肥大・通知メールコスト DoS・自動返信リフレクションを抑止 |
| 依存脆弱性の検知 | `.github/dependabot.yml`（npm = `/app`、GitHub Actions、週次） |

- レート制限はインメモリ（scale-to-zero 単一インスタンス前提）。複数インスタンス化時は共有ストアへ。

## 5. メール通知（Resend）

`src/lib/mail.ts` は既に運営者通知（`sendNotification`）が `/booking`・`/contact` 両フローに配線済み。
今回の追加:

- `sendAutoReply()`: 送信者への受付確認（自動返信）。`RESEND_API_KEY` 未設定なら no-op、失敗は握りつぶす（送信フローを妨げない）。
- 運営者通知に管理画面ディープリンク（`/admin/bookings`・`/admin/messages`）を付与。
- `.env.example` に `NOTIFICATION_FROM` を明記。
- 送信ドメイン（DKIM/SPF）は iCloud+ 受信と共存（[18-custom-domain-email.md](./18-custom-domain-email.md) 手順C）。
  単一の SPF（`include:icloud.com include:_spf.resend.com`）に統合、DKIM セレクタは別系統。**DNS 適用は未実施（要手動）**。

## 検証

- `npx tsc --noEmit`／`npm run lint`／`npm run test:run`（79件）／`npm run build` すべて通過。
- 本番ビルドの standalone サーバで全セキュリティヘッダの出力、`NEXT_PUBLIC_GA_ID` 未設定時の
  GA 非出力、JSON-LD（ProfessionalService＋WebSite）を確認。
- 新ロジックに単体テスト追加（`rate-limit.test.ts`／`mail.test.ts`）。

## 残（手動・運用）

- GA4: 測定IDを Actions 変数 `NEXT_PUBLIC_GA_ID` に設定。
- Resend: ドメイン認証（DKIM）＋ SPF 統合の DNS 適用、Cloud Run へ `RESEND_API_KEY`／
  `NOTIFICATION_EMAIL`／`NOTIFICATION_FROM` を設定。
- CSP: 本番各ページのコンソールに違反が出ないか確認し、可能なら nonce 方式へ移行して
  `'unsafe-inline'` を外す。
