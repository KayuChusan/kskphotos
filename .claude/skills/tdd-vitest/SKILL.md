---
name: tdd-vitest
description: "Vitest でテスト先行(RED-GREEN-REFACTOR)。Triggers on: TDD, テスト先行, テスト駆動, 機能追加のテスト, バグ修正のテスト, Vitest, リグレッションテスト, テスト書く"
---

# テスト駆動開発（TDD / Vitest）

出典: obra/superpowers `test-driven-development` を kskphotos（Vitest）向けに軽量化。

## 鉄則

```
失敗するテストなしに本番コードを書かない
```

テストが失敗するのを**自分の目で見ていない**なら、それが正しいものをテストしているか分からない。先にコードを書いたら、消してやり直す。

## サイクル（RED → GREEN → REFACTOR）

1. **RED** — 期待する振る舞いのテストを書く → `npm --prefix app run test:run` で**失敗を確認**（理由が正しい失敗か読む）
2. **GREEN** — 通すための**最小限**のコードを書く → 実行して pass を確認
3. **REFACTOR** — テスト緑のまま重複除去・整理 → 再実行して緑を維持

## 適用範囲
- **常に**: 新機能 / バグ修正 / リファクタ / 挙動変更
- **例外（人に確認）**: 使い捨てプロトタイプ / 生成コード / 設定ファイル
- 「今回だけTDD飛ばす」と思ったら STOP。それは合理化。

## バグ修正の型（リグレッション）
```
テスト書く → 実行(失敗) → 修正を入れる → 実行(pass)
→ 修正を一旦戻す → 実行(必ず失敗するか確認) → 修正を戻す → 実行(pass)
```
赤→緑を確認していないリグレッションテストは「書いた」と言わない（→ `verify-before-done`）。

## kskphotos メモ
- 実行: `npm --prefix app run test:run`（CLAUDE.md 規約）
- 配置・命名は既存 Vitest テストに合わせる
- 関連: `root-cause-debug`（フェーズ4で失敗テストを作る） / `verify-before-done`（完了前の検証）
