# 10. ローカル開発環境セットアップ手順

## このドキュメントの目的

kskphotos をゼロから自分の PC で動かすまでの手順を、順を追って説明します。「リポジトリを取得 → 依存をインストール → 環境変数を設定 → ローカル DB を起動 → DB を初期化 → 開発サーバを起動」という流れを、迷わずなぞれるようにすることがゴールです。初めて触る人でも `http://localhost:3001` でサイトが表示されるところまで到達できます。

> 補足: この章のコマンドはすべて **`app/` ディレクトリ**（Next.js アプリ本体）で実行します。リポジトリ直下には `terraform/` や `docs/` もありますが、開発作業の起点は `app/` です。

---

## 1. 前提ツール

セットアップを始める前に、以下のツールを用意します。

| ツール | 推奨バージョン | 用途 | 確認コマンド |
|--------|---------------|------|-------------|
| **Node.js** | 20 以上（LTS 推奨） | Next.js / TypeScript の実行環境 | `node -v` |
| **npm** | Node.js に同梱 | パッケージ管理（依存のインストール、スクリプト実行） | `npm -v` |
| **Docker** + Docker Compose | 最新の Docker Desktop 等 | ローカル PostgreSQL を起動するため | `docker -v` / `docker compose version` |
| **Git** | 任意 | リポジトリ取得 | `git --version` |

**補足:**

- Node.js 20 以上を推奨する理由は、`package.json` の `devDependencies` で `@types/node: ^20` を指定しているためです（Next.js 16 自体も Node.js 20 系以上を前提とします）。新しい LTS 系なら基本的に問題ありません。
- Docker は **DB（PostgreSQL）専用** です。アプリ本体（Next.js）は Docker ではなく `npm run dev` でホスト側に直接立てます。
- `docker compose`（半角スペース区切り）は Docker に統合された新しい呼び出し方です。古い環境では `docker-compose`（ハイフン）の場合があります。

---

## 2. リポジトリ取得 → 依存インストール

リポジトリを取得し、`app/` ディレクトリへ移動して依存パッケージをインストールします。

```bash
# リポジトリを取得（既に手元にある場合はこの手順は不要）
git clone <このリポジトリのURL> kskphotos
cd kskphotos/app

# 依存パッケージをインストール
npm ci
```

| コマンド | 使う場面 |
|---------|---------|
| `npm ci` | **推奨。** `package-lock.json` のとおりに正確に入れ直す。クリーンで再現性が高い |
| `npm install` | `package-lock.json` が無い／ロックを更新したい場合 |

> なぜ `npm ci` 推奨か: `ci`（clean install）は `node_modules` を作り直してロックファイルに完全一致させるため、「自分の環境だけ動かない」を防げます。

---

## 3. 環境変数の設定（`.env`）

アプリは DB 接続先などを **環境変数**（プログラムの外から渡す設定値）から読み取ります。雛形 `app/.env.example` をコピーして `app/.env` を作成します。

```bash
# app/ ディレクトリで実行
cp .env.example .env
```

### 3-1. 最低限設定すべきキー: `DATABASE_URL`

ローカル開発で**必ず**正しく設定するのは `DATABASE_URL`（DB の接続先）です。後述する `docker-compose.yml` の DB 設定（ユーザー `kskphotos` / パスワード `kskphotos_dev` / DB 名 `photo_portfolio` / ホスト側ポート `5433`）にぴったり一致させます。

```env
DATABASE_URL="postgresql://kskphotos:kskphotos_dev@localhost:5433/photo_portfolio"
```

`.env.example` には既にこの値が入っているので、コピーしただけのローカル開発なら **そのままで動きます**。

> 接続文字列の読み方:
> `postgresql://【ユーザー】:【パスワード】@【ホスト】:【ポート】/【DB名】`
> ホストは `localhost`、ポートは **`5433`**（コンテナ内 5432 を PC 側 5433 に転送している）である点に注意してください（→ [4 章](#4-ローカル-db-を起動docker)）。

`DATABASE_URL` は 2 か所から参照されます。どちらも `process.env.DATABASE_URL` を見ているので、`.env` に正しく書けば両方に効きます。

| 参照箇所 | 役割 |
|---------|------|
| `app/src/lib/prisma.ts` | **アプリ実行時**の DB 接続（`PrismaPg` アダプタの `connectionString`） |
| `app/prisma.config.ts` | **Prisma CLI（migrate 等）** の接続先（`datasource.url`） |

> 補足: `app/prisma/schema.prisma` の `datasource db` は `provider = "postgresql"` だけを書き、接続 URL は持ちません。CLI の接続先は `prisma.config.ts` の `datasource.url`（= `process.env.DATABASE_URL`）から供給される設計です。

### 3-2. `.env.example` の主なキー一覧

| キー | 必須/任意 | 用途・メモ |
|------|----------|-----------|
| `DATABASE_URL` | **必須** | DB 接続先。ローカルは上記のとおり（`localhost:5433` / `photo_portfolio`） |
| `AUTH_SECRET` | 認証を試す時 | NextAuth.js v5 のセッション署名用シークレット。管理者ログイン機能を触る場合に設定（雛形には仮の値が入っている） |
| `AUTH_GOOGLE_ID` | 任意 | Google ログイン（管理者認証）のクライアント ID。未設定なら Google ログインが使えないだけ |
| `AUTH_GOOGLE_SECRET` | 任意 | 同上のクライアントシークレット |
| `GCS_BUCKET_NAME` | 任意（本番用） | Cloud Storage のバケット名。**画像保存先の切替キー。** これが設定されていれば GCS、未設定ならローカル保存になる（後述）。ローカルは未設定で可 |
| `GCS_PROJECT_ID` | 任意（本番補助/将来用） | GCP プロジェクト ID。`.env.example` の雛形キー。なお `storage.ts` は GCS 認証に ADC（Cloud Run のサービスアカウント）を使い、このキー自体を直接は読まない |
| `RESEND_API_KEY` | 任意（将来用） | 依頼通知メール送信用 API キー。設定しなくても起動は可能 |
| `NOTIFICATION_EMAIL` | 任意（将来用） | 通知の宛先メールアドレス |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 任意（現状未使用） | `.env.example` に雛形として残っているキー。**現在の地図実装では参照されていません。** 地図ギャラリー（`photo-map.tsx`）は MapLibre GL JS を使い、地図スタイルとして無料の CARTO ラスタータイルを直接読み込むため、このトークンは不要です。空のままで地図は問題なく表示されます（`NEXT_PUBLIC_` 接頭辞はブラウザ側にも露出する公開値の意味） |

> **まず動かすだけなら、設定が必要なのは `DATABASE_URL` だけ** です。`GCS_*` は本番（Cloud Storage 配信）向け、メール系は将来用、`NEXT_PUBLIC_MAPBOX_TOKEN` は現状未使用です。いずれも空のままで起動を妨げません。
>
> 画像の保存先は `storage.ts` が **`GCS_BUCKET_NAME` の有無で GCS とローカルを切り替える** 設計のため、ローカル開発では GCS 認証情報なしで進められます（`GCS_BUCKET_NAME` 未設定時は `app/public/uploads/` に保存）。

---

## 4. ローカル DB を起動（Docker）

`app/docker-compose.yml` の `db` サービスで PostgreSQL を起動します。

```bash
# app/ ディレクトリで実行
docker compose up -d
```

`-d`（detached）はバックグラウンド起動の意味です。`docker-compose.yml` の中身は次のとおりです。

| 項目 | 値 | メモ |
|------|----|----|
| イメージ | `postgres:16-alpine` | PostgreSQL 16（軽量な alpine ベース） |
| ポート | `5433:5432` | **PC 側 `5433` → コンテナ内 `5432`**。`DATABASE_URL` のポートが 5433 なのはこのため |
| `POSTGRES_USER` | `kskphotos` | DB ユーザー |
| `POSTGRES_PASSWORD` | `kskphotos_dev` | DB パスワード（ローカル専用の開発値） |
| `POSTGRES_DB` | `photo_portfolio` | 初期作成される DB 名 |
| ボリューム | `pgdata` | データ永続化。`docker compose down` してもデータは残る |

起動確認・停止コマンド:

```bash
# 起動中のコンテナを確認
docker compose ps

# DB のログを見る（接続できない時の調査に）
docker compose logs db

# 停止（データは pgdata に残る）
docker compose down

# データごと削除してまっさらにしたい時（ローカルのみ。注意して使う）
docker compose down -v
```

> **共有 DB に関する注意:** 本番の Cloud SQL は姉妹サイト **こくみんPedia+** と**同一インスタンスを共有**しています（インスタンス本体は kokumin-pedia 側の Terraform が所有）。kskphotos は自分専用の DB を持ち、マイグレーションは自分の DB に対してのみ行います。**共有インスタンスに対する `reset` などの破壊的操作は避けてください。** 上記の `down -v` も対象は「ローカルの Docker ボリューム」だけであり、本番には影響しません。

---

## 5. DB を初期化（Prisma）

DB コンテナが起動したら、Prisma で「型付きクライアントの生成」と「テーブル作成（マイグレーション適用）」を行います。

> **重要:** このプロジェクトには **Prisma 用の npm エイリアス（`npm run db:*` のようなショートカット）はありません**（`package.json` の `scripts` は `dev / build / start / lint / test / test:run` のみ）。Prisma の操作はすべて **`npx prisma ...`** で実行します。

### 5-1. Prisma クライアントを生成

```bash
npx prisma generate
```

スキーマ（`app/prisma/schema.prisma`）から TypeScript 用のクライアントを生成します。出力先は `app/src/generated/prisma` です（`generator client` の `output` 指定）。`src/lib/prisma.ts` がこの生成物を `import` するため、**この生成を忘れるとアプリがビルド／起動できません**。

### 5-2. マイグレーションを適用（テーブル作成）

```bash
npx prisma migrate dev
```

`app/prisma/migrations/` のマイグレーション（現在 4 件）を順に適用し、ローカル DB に `User` / `Account` / `Session` / `Collection` / `Photo` / `Service` / `Booking` / `BlogPost` / `ContactMessage` の各テーブルを作成します（`migrate dev` は未生成なら Prisma クライアントの生成も合わせて行います）。

代替手段として、マイグレーション履歴を作らず**スキーマを DB に直接反映するだけ**の方法もあります。

| コマンド | 使う場面 |
|---------|---------|
| `npx prisma migrate dev` | **推奨。** マイグレーション履歴（`prisma/migrations/`）を使った正式な反映。本番と同じ流れ |
| `npx prisma db push` | スキーマを手早く DB へ反映したいだけの時（履歴は残さない） |

### 5-3. seed（初期データ投入）について

`app/prisma.config.ts` には seed コマンド（`npx tsx prisma/seed.ts`）が**設定済み**です。ただし——

> **正直な注記:** **`app/prisma/seed.ts` というファイルは現状まだ存在しません。** 設定だけ用意されている状態です。そのため `npx prisma db seed` を実行しても投入される初期データはなく（参照先ファイルが無いためエラーになります）、現時点では seed 手順はスキップしてください。初期データが必要になったら `prisma/seed.ts` を作成することで、設定済みの seed コマンドが機能するようになります。

### 5-4. 接続の仕組み（補足）

`src/lib/prisma.ts` は `@prisma/adapter-pg` の `PrismaPg` アダプタを使い、`process.env.DATABASE_URL` で接続します。開発時はホットリロードでの接続多重化を防ぐため、`globalThis` にクライアントを保持する実装になっています（本番では保持しません）。設定としては `.env` の `DATABASE_URL` が正しければ動く、という理解で十分です。

---

## 6. 開発サーバを起動

ここまで終わったら開発サーバを起動します。

```bash
npm run dev
```

ブラウザで以下を開きます。

```
http://localhost:3001
```

> **ポートは 3001** です（`package.json` の `dev` が `next dev -p 3001`）。`build` 後に本番モードで動かす場合の `npm start` も `-p 3001` で同じポートです。

---

## 7. 動作確認とトラブルシュート

### 7-1. 起動できた時の確認ポイント

- `http://localhost:3001` でトップページが表示される。
- DB が必要なページ（写真一覧など）でエラーが出ない＝ `DATABASE_URL` とマイグレーションが正しい。

### 7-2. よくあるつまずきと対処

| 症状 | 原因として疑う点 | 対処 |
|------|----------------|------|
| `npm run dev` で「ポート 3001 が使用中」 | 他プロセスが 3001 を占有 | 既存プロセスを止める。`lsof -i :3001` で特定し終了 |
| DB に繋がらない／接続エラー | DB コンテナが未起動、またはポート 5433 競合 | `docker compose ps` で起動確認。`lsof -i :5433` で競合を確認 |
| `Cannot find module '@/generated/prisma/...'` 等 | `npx prisma generate` 忘れ | `npx prisma generate` を実行してから再起動 |
| マイグレーション未適用でテーブルが無い | `migrate dev` 未実行 | `npx prisma migrate dev` を実行 |
| `DATABASE_URL` 関連のエラー | `.env` 未作成、値の打ち間違い（特にポート 5433／DB 名 `photo_portfolio`） | `.env.example` をコピーし直し、接続文字列を再確認 |
| `.env` を変えたのに反映されない | サーバが古い設定のまま | `npm run dev` を再起動（環境変数は起動時に読み込まれる） |
| seed が動かない | `prisma/seed.ts` が未作成（5-3 参照） | 現状は seed をスキップ（仕様どおり） |

### 7-3. DB を作り直したい時（ローカル限定）

ローカルの DB を完全に作り直したい場合は次の順で行います。**この操作はローカルの Docker ボリュームのみが対象**で、共有の Cloud SQL には一切影響しません。

```bash
docker compose down -v        # ローカル DB のデータを削除
docker compose up -d          # DB を再起動
npx prisma migrate dev        # マイグレーション再適用
```

---

## 8. よく使うコマンド早見表

`package.json` の npm スクリプトと、Prisma 用の `npx` コマンドをまとめます。

### npm スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバ起動（`next dev -p 3001`、ホットリロードあり） |
| `npm run build` | 本番ビルド（`next build`） |
| `npm start` | ビルド成果物を本番モードで起動（`next start -p 3001`） |
| `npm run lint` | ESLint 実行 |
| `npm test` | テスト（vitest、ウォッチモード） |
| `npm run test:run` | テストを 1 回だけ実行（`vitest run`、CI 向け） |

### Prisma（npm エイリアスは無いので `npx prisma`）

| コマンド | 内容 |
|---------|------|
| `npx prisma generate` | スキーマから型付きクライアントを生成（`src/generated/prisma`） |
| `npx prisma migrate dev` | マイグレーション適用（テーブル作成・更新） |
| `npx prisma db push` | スキーマを DB に直接反映（履歴を残さない簡易版） |
| `npx prisma studio` | ブラウザで DB の中身を閲覧・編集する GUI |
| `npx prisma migrate status` | マイグレーションの適用状況を確認 |

### Docker（ローカル DB）

| コマンド | 内容 |
|---------|------|
| `docker compose up -d` | DB コンテナ起動（バックグラウンド） |
| `docker compose ps` | コンテナの状態確認 |
| `docker compose logs db` | DB のログ確認 |
| `docker compose down` | DB 停止（データは保持） |
| `docker compose down -v` | DB 停止 + データ削除（ローカルのみ） |

---

## 9. セットアップの全体フロー

ここまでの手順を 1 枚にまとめると次のとおりです。

```mermaid
flowchart TD
    A["前提ツール確認<br/>Node 20+ / npm / Docker"] --> B["リポジトリ取得 → app/ へ移動"]
    B --> C["npm ci で依存インストール"]
    C --> D[".env.example を .env にコピー"]
    D --> E["DATABASE_URL を確認<br/>localhost:5433 / photo_portfolio"]
    E --> F["docker compose up -d<br/>ローカル DB 起動"]
    F --> G["npx prisma generate<br/>クライアント生成"]
    G --> H["npx prisma migrate dev<br/>テーブル作成"]
    H --> I["npm run dev<br/>開発サーバ起動"]
    I --> J["http://localhost:3001 で確認"]

    H -. "seed は prisma.config.ts に設定済みだが<br/>prisma/seed.ts 未作成のためスキップ" .-> H
```

---

## 10. まとめ

- 作業ディレクトリは **`app/`**。アプリはホスト側、DB だけ Docker。
- 設定が必須なのは **`DATABASE_URL`** だけ。`.env.example` をコピーすればローカル値が入っている。
- DB はポート **5433**、DB 名 **`photo_portfolio`**（`docker-compose.yml` に一致）。
- Prisma 操作は **`npx prisma ...`**（npm エイリアスは無い）。`generate` → `migrate dev` の順。
- **seed は設定済みだが `prisma/seed.ts` は未作成**——現状は seed をスキップする。
- 開発サーバは **`http://localhost:3001`**。
- `GCS_*` は本番（Cloud Storage）向け、メール系は将来用、`NEXT_PUBLIC_MAPBOX_TOKEN` は現状未使用（MapLibre + 無料 CARTO タイルで地図は動く）。共有 Cloud SQL への破壊的操作は避ける。
