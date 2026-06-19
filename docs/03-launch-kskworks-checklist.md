# 03. kskworks.jp 公開ランブック（コピペ用）

本番 URL: `https://kskphotos-jfiomxgszq-an.a.run.app` → 独自ドメイン `kskworks.jp` へ。
DNS/レジストラ: **お名前.com**（NS: `dns1/dns2.onamae.com`、apex は現在パーキング IP `150.95.255.38`）。

## 担当の凡例

- 🤖 **私（Claude）が実行可能** — ローカルが `ksk.nkym0403@gmail.com` で認証済み＋ADC 有効。`terraform apply` 等を代行できる。
- 👤 **あなたのみ可能** — レジストラ／各 Web コンソールのログインが必要（私には不可）。

> 既に存在する Secret（確認済み）: `kskphotos-auth-secret` / `kskphotos-database-url` / `kskphotos-google-client-id` / `kskphotos-google-client-secret`。→「Secret 投入」作業は**完了済み**。残るは Resend 用のみ。

---

## ⚠️ terraform apply は必ず `-target` で

`terraform plan` 全体には**未 apply の写真用 CDN（~$18/月・保留中）**が含まれる。全体 apply すると CDN が立ち上がる。**ドメイン関連だけを `-target` で**適用すること。

```bash
cd /Users/ksk.nkym/Projects/kskphotos/terraform
# 中身を固定してから適用（誤適用ゼロ）
terraform plan  -target='module.cloud_run.google_cloud_run_domain_mapping.app[0]' -out=tfplan
terraform apply tfplan
```

---

## 🔴 Phase 0: 管理画面の穴を塞ぐ（最優先・ドメインと独立）

現状 `ALLOW_EMAIL_SIGNIN="true"` ＋ 公知の `ADMIN_EMAIL` ＝ **パスワード無しで誰でも /admin に侵入可能**。
順序が命：**Google ログインが通ることを確認してから** email サインインを無効化する（先に無効化すると締め出される）。

1. 👤 **OAuth リダイレクト URI 追加**（run.app 用がまだなら）
   Google Cloud Console → 「API とサービス」→「認証情報」→ 対象 OAuth 2.0 クライアント →
   - 承認済みリダイレクト URI: `https://kskphotos-jfiomxgszq-an.a.run.app/api/auth/callback/google`
   - 承認済み JavaScript 生成元: `https://kskphotos-jfiomxgszq-an.a.run.app`
2. 👤 **Google ログイン確認**: `https://kskphotos-jfiomxgszq-an.a.run.app/auth/signin` で **Google ボタン**から入れることを実機確認。
3. 🤖 **email サインイン無効化**（確認後に私が実行）
   `terraform/resources.tf` の `ALLOW_EMAIL_SIGNIN = "true"` → `"false"` に変更し:
   ```bash
   cd /Users/ksk.nkym/Projects/kskphotos/terraform
   terraform plan  -target='module.cloud_run.google_cloud_run_v2_service.app' -out=tfplan
   terraform apply tfplan   # 新リビジョン = 現行イメージ + env 変更のみ（イメージは :latest 据え置き）
   ```

---

## Phase 1: ドメイン接続（HTTPS で kskworks.jp が開く）

### 1-1. 👤 所有権確認（Search Console）
1. https://search.google.com/search-console を **`ksk.nkym0403@gmail.com`** で開く（= GCP プロジェクトと同一アカウント必須）。
2. 「プロパティを追加」→ **ドメイン** を選択 → `kskworks.jp` を入力。
3. 表示される **TXT 値**（`google-site-verification=...`）をコピー。

### 1-2. 👤 TXT を お名前.com に追加
お名前.com Navi → ドメイン → **DNS** → 「DNS設定/転送設定」→ `kskworks.jp` → **DNSレコード設定を利用する**:
- ホスト名: （空欄＝apex） / TYPE: `TXT` / VALUE: `google-site-verification=...`
- 反映後、Search Console に戻って **「確認」**。

### 1-3. 🤖 ドメインマッピング作成（私が実行）
```bash
cd /Users/ksk.nkym/Projects/kskphotos/terraform
terraform plan  -target='module.cloud_run.google_cloud_run_domain_mapping.app[0]' -out=tfplan
terraform apply tfplan
terraform output domain_mapping_records   # ← apex 用 A×4 / AAAA×4 が出る
```

### 1-4. 👤 A/AAAA を お名前.com に登録
お名前.com の DNSレコード設定で:
- **既存の A `150.95.255.38`（パーキング）を削除**。
- 上記 output の **A レコード 4本**（ホスト名空欄, TYPE `A`）を登録。
- **AAAA レコード 4本**（ホスト名空欄, TYPE `AAAA`）を登録。
- ※ apex は CNAME 不可。www も使うなら `www` → `ghs.googlehosted.com`（CNAME）。

### 1-5. ⏳ SSL プロビジョニング待ち
Google が自動で証明書発行（通常 15分〜1時間、最大 24h）。`https://kskworks.jp` が開けば成功。

---

## Phase 2: Google ログインを kskworks.jp で有効化

1. 👤 **OAuth に本番ドメイン追加**: Cloud Console の同 OAuth クライアントに
   - リダイレクト URI: `https://kskworks.jp/api/auth/callback/google`
   - JS 生成元: `https://kskworks.jp`
2. 🤖 **AUTH_URL 切替**（私が実行）: `terraform/terraform.tfvars` に `auth_url = "https://kskworks.jp"` を追加し:
   ```bash
   cd /Users/ksk.nkym/Projects/kskphotos/terraform
   terraform plan  -target='module.cloud_run.google_cloud_run_v2_service.app' -out=tfplan
   terraform apply tfplan
   ```
3. 👤 **本番ログイン確認**: `https://kskworks.jp/auth/signin` で Google ログイン。
   → 通ったら **Phase 0-3 の email 無効化**を（未実施なら）ここで実行。

---

## Phase 3: 仕上げ（任意・公開後でも可）

- 👤 **実写真投入**: 現状サンプル（picsum）→ 本物へ。/admin から登録。
- **Resend メール通知**（任意）:
  1. 👤 Resend でアカウント＋API キー、送信元 `kskworks.jp` のドメイン認証（SPF/DKIM を お名前.com に追加。※既存 `v=spf1 -all` は Resend を含む値へ要変更）。
  2. 🤖 Secret 作成: `gcloud secrets create kskphotos-resend-api-key`（値は 👤 が投入）。
  3. 🤖 `terraform.tfvars` に `notification_email=...` ＋ `enable_resend=true` → `-target` apply。
- 👤 **法務**: privacy に事業者情報、特商法表記（撮影料金を取るなら推奨）。運営者名/住所/電話の公開レベルを決めたら 🤖 がページ化。

---

## コマンド早見表

```bash
# 現状確認
gcloud config get-value account project
dig A kskworks.jp +short ; dig NS kskworks.jp +short

# 変更前は必ず plan を確定（-out）→ apply tfplan
cd /Users/ksk.nkym/Projects/kskphotos/terraform
terraform plan  -target='module.cloud_run.google_cloud_run_domain_mapping.app[0]' -out=tfplan && terraform apply tfplan
terraform output domain_mapping_records

# サービス env だけ更新（auth_url 切替 / email 無効化）
terraform plan  -target='module.cloud_run.google_cloud_run_v2_service.app' -out=tfplan && terraform apply tfplan
```
