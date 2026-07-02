---
name: ship
description: "変更を本番まで届ける定型リリースフロー（検証→Codexレビュー→PR→CI→merge→デプロイ監視→本番確認）。Triggers on: 出荷, リリース, 本番反映, デプロイまで, PRまで, マージして, ship"
---

# ship — 変更を本番（kskworks.jp）まで届ける定型フロー

コード変更を「完了」と言える状態＝**本番で確認済み**まで運ぶ。途中を省略しない。

## フロー（この順で全部やる）

1. **ブランチ**: main にいるなら `git checkout -b <type>/<slug>`（type: feat/fix/chore/docs）
2. **ローカル検証**（app/ で全て通す）:
   ```bash
   npx tsc --noEmit && npm run lint && npm run test:run && npm run build
   ```
   ※ dev サーバー稼働中に `npm run build` を実行しない（`.next` を壊す）。先に `pkill -f "next dev"`
3. **docs 同期**: 設計判断・手順を変えたら `docs/`（連番 NN-*.md）を**同じコミットで**更新（CLAUDE.md 規約）。UI 変更は DESIGN.md 整合も確認
4. **Codex レビュー**（コミット前必須・CLAUDE.md 規約）:
   ```bash
   git add -A
   node "$HOME/.claude/plugins/cache/openai-codex/codex/1.0.4/scripts/codex-companion.mjs" review "--wait"
   ```
   指摘（P1/P2）は修正してから進む。P3 は判断して対応 or PR に明記
5. **コミット**: 日本語で「何を・なぜ」。末尾トレーラー必須:
   `Co-Authored-By:`（現行モデル名）と `Claude-Session:` の2行
6. **PR**: `gh pr create` — 概要/変更/検証を記載、末尾に 🤖 Generated with Claude Code
7. **CI 待ち**: `gh pr checks <番号>` を pending が消えるまでポーリング（lint-and-build ≈ 1.5分）
8. **マージ**: `gh pr merge <番号> --merge --delete-branch` → `git checkout main && git pull`
9. **デプロイ監視**: main push で deploy.yml が走る。
   ```bash
   did=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
   gh run watch "$did" --exit-status && gh run view "$did" --json conclusion -q .conclusion
   ```
10. **本番確認**: 変更内容が https://kskworks.jp に出ているか `curl` で実値検証（ステータスだけでなく、変更した文字列・ヘッダ・クラス名を grep）。**ここまでやって「完了」**

## 落とし穴（実績あり）

- デプロイの Prisma P2037（コネクション枯渇）は**再実行で解消**（`gh run rerun <id>`）
- seed 反映が必要な変更（`services-data.ts` 等）は SOURCE_MANAGED_IDS に入っているか確認（入っていないと本番 DB が更新されない）
- `NEXT_PUBLIC_*` はビルド時埋め込み＝deploy.yml の `--build-arg` 配線が必要
- CI/deploy が OIDC で落ちたら WIF の `github_repo`（terraform/resources.tf）とリポジトリ名の一致を疑う
