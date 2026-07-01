# 18. 独自ドメインメール（iCloud+ Custom Email Domain）

## このドキュメントの目的

`kskworks.jp` で**人が読み書きするメール**（例 `ksk@` / `info@kskworks.jp`）を送受信し、**普段使いの個人 Gmail へ転送**（手順D）するまでの設定手順を記録する。アプリの送信（Resend / `noreply@kskworks.jp` の一方向通知）とは別物で、両者を DNS 上で共存させる方法も含む。

## 方式の選定

| 方式 | 分離 | 費用 | 採否 |
|------|------|------|------|
| **iCloud+ Custom Email Domain** | △ 個人 Apple ID の受信箱に同居 | iCloud+ 内（追加ほぼ無し） | ✅ **採用** |
| Zoho Mail 無料 | ◎ 独立アカウント | ¥0 | 候補（個人と完全分離したい場合） |
| Google Workspace | ◎ 独立 Google アカウント | 約¥900/月 | 候補（組織化 Cloud Identity も同時解決したい場合） |

**採用理由**: 既存の iCloud+ にドメインを足すだけで追加費用がほぼ不要・Apple Mail / iPhone で完結。業務メールが個人 iCloud 受信箱に同居する点は許容（完全分離が必要になれば Zoho/Workspace へ移行可能）。

## 前提

- **iCloud+（有料）契約が必須**（50GB ¥130/月〜）。無料5GBでは Custom Email Domain は使えない。
- 新しい Apple ID は作らない。**既存の個人 Apple ID の iCloud Mail にドメインを追加**する形（受信は個人 iCloud 受信箱に届く）。
- DNS は **お名前.com（NS: `dnsv.jp`）で手動管理**。Terraform 管理外。

## 現状の DNS（2026-06 時点・確認済み）

```
dig MX  kskworks.jp +short   →  （なし）
dig TXT kskworks.jp +short   →  "google-site-verification=..."   ← Search Console 用。消さない
dig NS  kskworks.jp +short   →  01〜04.dnsv.jp
```

- **MX は未設定** → iCloud の MX を新規追加する。
- **SPF（`v=spf1 ...`）は未設定** → iCloud の SPF を**新規追加**（既存を置換するのではない）。
- apex の `google-site-verification` TXT と、サイト用 A/AAAA（Cloud Run）・SSL は**触らない**。

## 手順A：Apple 側（ユーザー操作）

1. iCloud+ 契約者で iCloud Mail を有効化。
2. icloud.com →「**カスタムメールドメイン**」（または iPhone/Mac: Apple ID → iCloud → iCloud Mail → カスタムメールドメイン）→「**あなただけ**」を選択。
3. `kskworks.jp` を入力。
4. 使うアドレスを作成（例 `contact@kskworks.jp` / `ksk@kskworks.jp`）。
5. Apple が**追加すべき DNS レコードを提示**（MX×2・`apple-domain` 確認 TXT・SPF TXT・DKIM CNAME）→ 手順B で登録。
6. 登録後、Apple 画面で**検証**。Apple Mail / iCloud Web で送受信＆「差出人」に独自アドレス選択ができれば完了。

## 手順B：お名前.com の DNS（ユーザー操作・**Apple 提示の実値を優先**）

お名前.com Navi → ドメイン → DNS → 「DNSレコード設定」で以下を**追加**（既存 TXT/A/AAAA はそのまま）:

| 種別 | ホスト | 値（標準形／Apple 提示を優先） | 備考 |
|------|--------|------------------------------|------|
| MX | （空＝apex） | `mx01.mail.icloud.com`（優先度 10） | 受信用 |
| MX | （空＝apex） | `mx02.mail.icloud.com`（優先度 10） | 受信用 |
| TXT | （空＝apex） | `apple-domain=XXXXXXXX`（Apple 提示） | 所有権確認 |
| TXT | （空＝apex） | `v=spf1 include:icloud.com ~all` | **新規追加**（既存 SPF は無い） |
| CNAME | `sig1._domainkey` | `sig1.dkim.kskworks.jp.at.icloudmailadmin.com`（Apple 提示） | DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@kskworks.jp` | 任意・まず p=none |

注意:
- **SPF TXT は 1ドメイン1本のみ**。将来 Resend を足すときは 2本目を作らず、この1本に include を追記する（手順C）。
- `google-site-verification` の TXT は SPF とは別レコードなので共存可。消さない。

## 手順C：将来 Resend を有効化するときの共存（DNS を壊さない）

アプリ通知（`noreply@kskworks.jp` 送信）の Resend を後で有効化する場合、iCloud と同じ root ドメインで共存させる:

- **SPF は1本に統合**：`v=spf1 include:icloud.com include:_spf.resend.com ~all`（Resend の include 実値はダッシュボード提示に従う）。iCloud の分を消さず include を足す。
- **MX は iCloud のまま**（Resend は受信に root MX を使わない）。
- **DKIM はセレクタが別**（iCloud=`sig1._domainkey` / Resend=`resend._domainkey`）→ 衝突しない。

→ ランブック [03 章](./03-launch-kskworks-checklist.md) の Resend 項もこの方針に更新済み。

## 手順D：iCloud 受信 → 個人 Gmail へ転送（ユーザー操作）

受信メール（`ksk@` / `info@kskworks.jp`）を普段使いの個人 Gmail（`ksk.nkym0403@gmail.com`）に届けたい場合、iCloud Mail の**ルール（フィルタ）で `@kskworks.jp` 宛だけを転送**する。iCloud 全体転送（「メールの転送先」設定）は個人 iCloud メールまで巻き込むので**使わない**。

1. [icloud.com](https://www.icloud.com) → メール → 左下の歯車 → **「ルール」** →「ルールを追加」。
2. 条件: **「宛先/Cc」＋「次を含む」＋`kskworks.jp`**。
3. 動作: **「メッセージを次へ転送」→ `ksk.nkym0403@gmail.com`**。控えを iCloud にも残すなら「＋受信ボックスに残す」系の動作も併用（iCloud の UI では転送を選ぶと原本は残る挙動が既定）。
4. 保存。以降 `@kskworks.jp` 宛だけが個人 Gmail に届く。

補足（任意・今回のゴール外）:
- **Gmail 側で受信するだけ**なら追加設定は不要（転送メールはそのまま届く）。
- Gmail から**差出人 `ksk@kskworks.jp` で返信**したい場合は、Gmail の「アカウントとインポート → 他のメールアドレスを追加」で iCloud SMTP（`smtp.mail.me.com` / 要 App 用パスワード）を登録する。受信・転送だけなら不要。
- 転送は SPF/DKIM の観点で Gmail 側が稀に迷惑メール判定することがある。届かない時はまず Gmail の「迷惑メール」を確認。

## 検証（設定後）

- `dig MX kskworks.jp +short` → `mx01/mx02.mail.icloud.com`。
- `dig TXT kskworks.jp +short` → SPF が `include:icloud.com` を含む **1本のみ**＋既存の `google-site-verification`。
- Apple 設定画面でドメイン/DKIM が緑（検証済み）。
- 実テスト：外部（別アドレス）→ `ksk@kskworks.jp` 受信を確認。iCloud 受信箱に届き、かつ**手順Dのルールで個人 Gmail にも転送**されることを確認。
- iCloud から `ksk@kskworks.jp` 差出で返信 → 相手側でヘッダに SPF/DKIM pass。
- 既存サイト `https://kskworks.jp` が引き続き表示（A/AAAA 無傷）。

## 留意

- iCloud Custom Email Domain は @icloud.com 本体メールの**エイリアス的な送受信**（受信は個人 iCloud 受信箱に届く）。完全独立メールボックスではない。
- DNS 反映は最大数十分。検証は反映後に。
- Apple が出す `apple-domain` / DKIM 値は環境依存。**表の標準形でなく Apple 画面の実値**を登録する。
