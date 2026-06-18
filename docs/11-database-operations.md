# 11. データベース運用ガイド（Prisma）

## このドキュメントの目的

kskphotos のデータベース（DB）を、日々どう操作するかをまとめた「手を動かすための手順書」です。スキーマ（データの設計図）そのものの中身は [07. データモデル（Prisma）ガイド](./07-data-model.md) で解説しているので、本書は **操作** — クライアントの生成、スキーマ変更の反映、マイグレーション、シード、データ確認 — に集中します。

このプロジェクトでは **Prisma 7.x**（プリズマ。DB を TypeScript から型安全に操作する ORM ＝ Object-Relational Mapper）を使います。Prisma 7 は設定ファイルや接続のやり方が以前のバージョンと変わっているため、ネットで見つかる古い手順とズレることがあります。本書のコマンドは、このリポジトリの実ファイルに合わせてあります。

このドキュメントを読むと、次のことが分かります。

- Prisma がどのファイルでどう構成されているか
- スキーマを変えたとき、どんな順番で何を実行するか
- ローカル・CI・本番で、マイグレーションの扱いがどう違うか
- シード（初期データ投入）の現状と、共有 Cloud SQL を壊さないための注意

---

## 1. 前提と用語（初心者向け）

本文に入る前に、最低限の言葉を押さえます。

| 用語 | 意味（かみ砕いた説明） |
|------|----------------------|
| **スキーマ** | DB の「設計図」。どんなテーブルにどんな項目があるかの定義。`app/prisma/schema.prisma` に書く |
| **マイグレーション** | スキーマの変更を「履歴付き」で DB に適用する仕組み。`prisma/migrations/` に SQL が 1 変更 = 1 フォルダで残る |
| **Prisma クライアント** | スキーマから自動生成される、型付きの DB 操作用コード。これを `import` してクエリを書く |
| **`generate`** | スキーマから Prisma クライアント（コード）を作り直す操作。DB には触れない |
| **`migrate dev`** | スキーマ変更から新しいマイグレーションを作り、ローカル DB に適用する操作（開発用） |
| **`db push`** | マイグレーション履歴を作らずに、スキーマの今の姿を DB へ直接反映する操作（履歴なし） |
| **アダプタ** | Prisma が実際の DB ドライバと話すための橋渡し。ここでは `@prisma/adapter-pg`（PostgreSQL 用） |
| **`DATABASE_URL`** | 接続先 DB を表す 1 本の文字列。環境変数で渡す |

> このプロジェクトには **Prisma 用の npm スクリプト（エイリアス）はありません**。`app/package.json` の `scripts` は `dev` / `build` / `start` / `lint` / `test` / `test:run` の 6 つだけです。そのため Prisma の操作はすべて **`npx prisma ...`** で実行します。コマンドは `app/` ディレクトリの中で打ちます。

---

## 2. Prisma の構成（どのファイルが何をするか）

kskphotos の Prisma まわりは、次の 4 つのファイルで成り立っています。

| ファイル | 役割 |
|---------|------|
| `app/prisma/schema.prisma` | スキーマ本体。`model`（テーブル）と `enum` の定義。`datasource db` の `provider` は `postgresql` |
| `app/prisma.config.ts` | Prisma 7 の設定ファイル。スキーマ／マイグレーションの場所、接続先、シードコマンドを指定 |
| `app/src/generated/prisma/` | `generate` で **自動生成**されるクライアントの出力先（コードが置かれる場所） |
| `app/src/lib/prisma.ts` | アプリから使う Prisma クライアントの初期化。`PrismaPg` アダプタで `DATABASE_URL` に接続 |

### 2-1. `prisma.config.ts` の中身

Prisma 7 では、接続先 URL を `schema.prisma` ではなく設定ファイル側に書きます。実ファイルはこうなっています。

```ts
// app/prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

ポイントは 3 つです。

- `import "dotenv/config"` で `app/.env` の `DATABASE_URL` を読み込みます。だから CLI 実行時に環境変数が効きます（`dotenv` は `app/package.json` の依存に含まれています）。
- `datasource.url` が `process.env["DATABASE_URL"]` を指すので、**接続先は環境変数 1 本で切り替わります**（ローカル／CI／本番で同じコマンドが使える）。
- `migrations.seed` にシードコマンドが設定されています（中身の現状は [6 章](#6-シード初期データ投入) で正直に説明します）。

### 2-2. `schema.prisma` の出力設定

スキーマの先頭で、生成するクライアントの種類と出力先を決めています。

```prisma
// app/prisma/schema.prisma（抜粋）
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

`output` が `../src/generated/prisma`（= `app/src/generated/prisma`）なので、生成物はそこに出ます。この出力先は git 管理外で、必要なときに作り直す前提です（だから CI でも `generate` を実行します）。

> なお、Prisma 7 ではこの `datasource db` に `url` を書きません。接続先は 2-1 の `prisma.config.ts`（`datasource.url`）側で `DATABASE_URL` から渡します。

### 2-3. アプリ側の接続コード

アプリが実際に使うクライアントは `app/src/lib/prisma.ts` で初期化します。実ファイルの要点はこうです。

```ts
// app/src/lib/prisma.ts（抜粋）
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ...シングルトン用の globalForPrisma...

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}
```

- `import` 元が `@/generated/prisma/client`、つまり **2-2 で生成したクライアント**です。`generate` を一度も走らせていないとここで型エラーになります。
- `PrismaPg`（PostgreSQL 用ドライバアダプタ）に `DATABASE_URL` を渡して接続します。
- 開発時はホットリロードのたびに接続が増えないよう、`globalThis` にクライアントを 1 つだけ持つ（シングルトン）作りになっています（`NODE_ENV !== "production"` のときだけグローバルに保持）。

### 2-4. `DATABASE_URL` の用意

`app/.env.example` を雛形にして `app/.env` を作ります。ローカル DB は `app/docker-compose.yml` の `db` サービス（`postgres:16-alpine`、ホスト側ポート **5433** → コンテナ内 5432）です。

```bash
# app/ で実行
docker compose up -d db          # ローカル PostgreSQL を起動
cp .env.example .env             # 雛形をコピー（既にあれば不要）
```

ローカルの `DATABASE_URL` は次の値になります（`.env.example` に既定値として入っています）。

```
postgresql://kskphotos:kskphotos_dev@localhost:5433/photo_portfolio
```

> ユーザー `kskphotos` / パスワード `kskphotos_dev` / DB 名 `photo_portfolio` / ホスト側ポート `5433` は、すべて `docker-compose.yml` の設定と一致しています。

---

## 3. クライアント生成（`npx prisma generate`）

スキーマから Prisma クライアント（型付きのコード）を作り直す操作です。**DB には接続しません**（コードを生成するだけ）。

```bash
# app/ で実行
npx prisma generate
```

実行が必要なのは、おもに次のときです。

| タイミング | 理由 |
|-----------|------|
| `npm ci` 直後（クローン直後など） | 出力先 `src/generated/prisma` は git 管理外なので、生成しないと `import` が壊れる |
| `schema.prisma` を編集したあと | 追加した `model` / フィールドを型に反映するため |
| 型が見つからない／古いエラーが出たとき | 生成物とスキーマのズレをリセットするため |

なお `migrate dev`（4 章）を実行すると、その中で `generate` も自動的に走ります。手動の `generate` は「スキーマは変えていないが生成物が無い／古い」場合に使うのが基本です。

---

## 4. スキーマ変更の流れ

DB の構造を変えたいとき（テーブル追加、フィールド追加など）の標準手順です。

### 4-1. 手順

1. `app/prisma/schema.prisma` を編集する（`model` やフィールドを足す・直す）。
2. マイグレーションを作って、ローカル DB に適用する。

   ```bash
   # app/ で実行。--name には変更内容が分かる短い名前を付ける
   npx prisma migrate dev --name add_photo_caption
   ```

3. 生成物を確認する。
   - `app/prisma/migrations/` に新しいフォルダ（`<日時>_add_photo_caption/migration.sql`）が増えているか。
   - 型エラーが消えているか（`migrate dev` が `generate` も走らせるので、通常はここで型も更新済み）。

この `migrate dev` が、kskphotos の **正式なスキーマ変更方法**です。マイグレーションは「変更の履歴」として `prisma/migrations/` に SQL で残るため、あとから「いつ何を変えたか」を追えます。実際このリポジトリには次のように複数のマイグレーションが履歴として並んでいます。

```
app/prisma/migrations/
├── 20260610044645_init/             # 初期スキーマ
├── 20260610070324_add_blur_data_url/
├── 20260610095357_add_develop_notes/
├── 20260610121712_add_collections/
└── migration_lock.toml              # provider = "postgresql"
```

### 4-2. `migrate dev` と `db push` の使い分け

| 操作 | 履歴 | 向いている場面 | このプロジェクトでの位置づけ |
|------|------|--------------|------------------------------|
| `npx prisma migrate dev` | **残る**（`migrations/` に SQL） | 本番に持っていく、チームで共有する変更 | ローカル開発の正規手順 |
| `npx prisma db push` | 残らない | とりあえず形を試す試作（プロトタイプ）、使い捨て DB の初期化 | CI の使い捨て DB セットアップで使用（5 章） |

ざっくり言うと、**「履歴として残したい変更は `migrate dev`」「履歴がいらない使い捨ては `db push`」** です。残したい変更を `db push` だけで済ませると、本番に適用すべき SQL が記録されず後で困ります。

---

## 5. マイグレーションの適用（ローカル / CI / 本番）

「いつ・どこで・どのコマンドで」スキーマを DB へ反映するかは、環境ごとに違います。ここは混同しやすいので、実ファイルに即して正確にまとめます。

| 環境 | 反映方法 | 接続先 | 備考 |
|------|---------|--------|------|
| **ローカル** | `npx prisma migrate dev` | ローカル PostgreSQL（5433） | 履歴付き。開発の正規手順（4 章） |
| **CI** | `npx prisma db push` | 使い捨ての CI 用 PostgreSQL | テスト・ビルドのためだけに毎回作る一時 DB |
| **本番** | （※後述） | 共有 Cloud SQL の kskphotos DB | デプロイ自動化には**マイグレーション適用ステップは含まれていない** |

### 5-1. CI（`.github/workflows/ci.yml`）

CI では PR ごとに、ジョブ内で `postgres:16` のサービスコンテナを立て、そこへ向けてスキーマを反映します。手順は次の順です。

```yaml
# .github/workflows/ci.yml（要点）
- name: Generate Prisma client
  run: npx prisma generate
- name: Apply database schema
  run: npx prisma db push
```

- DB 接続先はジョブの `env.DATABASE_URL`（`postgresql://postgres:postgres@localhost:5432/kskphotos_ci?schema=public`）です。これは **CI 専用の使い捨て DB** で、ジョブが終われば消えます。
- ここで `migrate dev`（履歴付き）ではなく **`db push`（履歴なし）** を使うのは、使い捨て DB に「今のスキーマの姿」を素早く反映できれば十分だからです。
- そもそも CI でスキーマを用意する理由は、`next build` が一部ページのビルド時（`generateStaticParams`）に DB へ接続するためです（`ci.yml` のコメントに明記）。テーブルが無いとビルドが失敗します。
- なお CI のステップ全体は、`generate` → `db push` → `lint` → `tsc --noEmit`（型チェック）→ `test:run` → `build` の順で実行されます。

### 5-2. 本番（`.github/workflows/deploy.yml`）の正直な実態

main へ push すると `deploy.yml` が走り、GCP へデプロイします。ここで **DB に関して何が起きているか** を正確に説明します。

- デプロイ中に **Cloud SQL Auth Proxy**（Cloud SQL へ安全に TCP 接続するための公式プロキシ）を起動し、`Build Docker image` ステップの `next build` がビルド時に共有 Cloud SQL の kskphotos DB を**参照（読み取り）**できるようにしています。これは ISR ページが `generateStaticParams` でビルド時に DB を読むためで、CI の理由と同じです（接続文字列は Secret Manager の `kskphotos-database-url` から取得し、`--build-arg DATABASE_URL` で渡しています）。
- ただし `deploy.yml` には **`migrate deploy` も `db push` も含まれていません**。つまり**デプロイの自動処理は本番 DB のスキーマを変更しません**。プロキシはあくまで「ビルドが DB を読むため」に使われています。

したがって、本番（共有 Cloud SQL の kskphotos DB）へスキーマ変更を反映する作業は、**現状この自動デプロイには含まれていない**、というのが正直なところです。スキーマ変更を本番に適用する場合は、別途その DB に対して手動で行う必要があります（一般的には Cloud SQL Auth Proxy 経由でローカルから `DATABASE_URL` を本番に向け、`npx prisma migrate deploy` を実行する形になりますが、本書執筆時点でこのワークフローは自動化されていません）。本番へ適用する際は、必ず次章の **共有インスタンスの注意** を守ってください。

---

## 6. シード（初期データ投入）

シードとは、開発用の初期データ（サンプルの写真・サービスなど）を DB に流し込む処理です。

**現状の正直な説明：**

- `app/prisma.config.ts` には `migrations.seed = "npx tsx prisma/seed.ts"` という**シードコマンドが設定済み**です。
- しかし、その**実体である `app/prisma/seed.ts` は現時点で存在しません**。

つまり「設定はあるがファイルは未作成」という状態です。この状態で `npx prisma db seed` を実行しても、`prisma/seed.ts` が無いため失敗します。

**シードを作る場合：** 置き場所だけ案内します。設定（`prisma.config.ts`）が `prisma/seed.ts` を指しているので、ファイルは **`app/prisma/seed.ts`** に作成します。`npx tsx`（TypeScript をそのまま実行するツール）で動く前提なので、`@/generated/prisma/client` から `PrismaClient` を読み込んで初期データを `create` するスクリプトとして書きます。作成後は `app/` で `npx prisma db seed` で実行できます。

> ※ `tsx` は `app/package.json` の直接依存には入っていません（`npx tsx` は未インストール時に自動取得します）。シードを常用するなら `npm i -D tsx` で devDependency に固定しておくと安定します。
>
> ※ 本書では架空の seed 手順を断定しません。実際に `seed.ts` を作成したら、本章を実コードに合わせて更新してください。

---

## 7. Prisma Studio でデータを確認する

`Prisma Studio` は、DB の中身をブラウザで表形式に見て・編集できる GUI ツールです。SQL を書かずにレコードを確認できるので、開発中の動作チェックに便利です。

```bash
# app/ で実行（DATABASE_URL の向き先の DB を開く）
npx prisma studio
```

ブラウザが開き、各テーブル（`Photo` / `Service` / `Booking` など）の中身を一覧・検索・編集できます。**接続先は `DATABASE_URL`** なので、何を開いているかは常に環境変数の値で決まります。本番 DB に向けたまま Studio で編集すると本番データを直接いじることになるため、原則ローカル DB に向けて使ってください。

---

## 8. 共有 Cloud SQL の注意（最重要）

kskphotos の本番 DB は、姉妹サイト「こくみんPedia+（kokumin-pedia）」と **同一の Cloud SQL インスタンスを共有**しています。ここを誤ると姉妹サイトを巻き込んで壊す危険があるため、所有境界と禁止事項を明確にします。

### 8-1. 所有境界

| 対象 | 所有・管理 |
|------|-----------|
| Cloud SQL **インスタンス本体** | **kokumin-pedia 側の Terraform** が所有・管理する |
| kskphotos の **データベース** | kskphotos が持つ。マイグレーションは**自分の DB に対してのみ**行う |

同じインスタンスの中に、サイトごとに別々のデータベースが同居しているイメージです。kskphotos がやってよいのは「自分のデータベースに対する操作」だけです。

### 8-2. やってはいけないこと

- **`npx prisma migrate reset` を共有インスタンスに対して実行しない。** `reset` は DB を作り直す破壊的操作で、共有環境では他サイトを巻き込む恐れがあります。`reset` を使うのはローカルの使い捨て DB だけにしてください。
- **インスタンス本体への操作（作成・削除・設定変更）を kskphotos 側から行わない。** インスタンスは kokumin-pedia の Terraform が所有しているため、こちらから触ると IaC の管理状態とズレます。
- **`DATABASE_URL` の向き先を必ず確認する。** 本番に向いたまま `db push` / `reset` / Studio 編集をすると本番データを直接変更します。実行前に接続先を確認する癖をつけてください。

### 8-3. 安全に進めるための原則

- 試行錯誤（履歴のいらない変更）は**ローカル DB**で `db push` または `migrate dev`。
- 残したい変更は**ローカルで `migrate dev`** して `migrations/` に記録。
- 本番（共有インスタンスの kskphotos DB）への反映は、記録済みマイグレーションを使い、自分の DB だけを対象に、破壊的操作を避けて行う。

---

## 9. 変更フロー（全体図）

スキーマ変更が、どの環境にどう流れていくかを 1 枚にまとめます。

```mermaid
flowchart TD
    A["schema.prisma を編集"] --> B["npx prisma migrate dev --name ...<br/>ローカル DB に適用 + クライアント生成"]
    B --> C["migrations/ に SQL が残る<br/>動作を Prisma Studio で確認"]
    C --> D["コミット & PR を作成"]
    D --> E["CI: ci.yml"]
    E --> E1["npx prisma generate"]
    E1 --> E2["npx prisma db push<br/>使い捨て CI 用 DB"]
    E2 --> E3["lint / type-check / test / build"]
    E3 --> F["main へマージ → deploy.yml"]
    F --> G["Cloud SQL Auth Proxy 起動<br/>build が DB を読むためだけ"]
    G --> H["Docker build → Cloud Run デプロイ<br/>スキーマ適用は含まない"]
    H --> I["本番 DB へのスキーマ反映は<br/>自動化されていない（別途手動）"]

    style I fill:#ffe6e6,stroke:#cc0000
    style E2 fill:#fff3cd,stroke:#b8860b
```

---

## 10. よく使うコマンド早見表

すべて `app/` ディレクトリで実行します。

| 目的 | コマンド | DB に触る？ |
|------|---------|:-----------:|
| クライアント生成（コードのみ） | `npx prisma generate` | × |
| スキーマ変更 → ローカル適用（正規手順） | `npx prisma migrate dev --name <名前>` | ○（ローカル） |
| 履歴なしで今のスキーマを反映（試作・使い捨て） | `npx prisma db push` | ○ |
| 記録済みマイグレーションを適用（本番想定） | `npx prisma migrate deploy` | ○ |
| データを GUI で確認 | `npx prisma studio` | ○（読み書き） |
| シード実行（※ `prisma/seed.ts` 作成後） | `npx prisma db seed` | ○ |

> 共有 Cloud SQL に対しては `migrate reset` を実行しないこと。接続先は常に `DATABASE_URL` で決まる点に注意。

---

## 関連ドキュメント

- [07. データモデル（Prisma）ガイド](./07-data-model.md) — スキーマ（モデル・enum・リレーション）の中身の解説
- [03. GitHub Actions CI/CD ガイド](./03-github-actions.md) — `ci.yml` / `deploy.yml` の全体像
- [02. GCP Terraform ガイド](./02-gcp-terraform.md) — Cloud SQL を含む GCP インフラの管理
