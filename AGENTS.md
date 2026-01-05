# Diff Comment Agent Notes

## 概要

- VS Code の行にコメントを追加し、行末に常時表示する拡張です。
- コメントは一括でクリップボードにコピーできます。
- 通常エディタと diff エディタの両方に対応しています。

## 主要コマンドとショートカット

- コメント追加: `Diff Comment: Add Comment to Current Line`
  - `Ctrl+Shift+C` / `Cmd+Shift+C`
- 一括コピー: `Diff Comment: Copy All Comments`
  - `Ctrl+Shift+Enter` / `Cmd+Shift+Enter`

## 表示・動作仕様

- 追加したコメントは行末にハイライト付きで表示されます。
- 送信（コピー）後に保存済みコメントはクリアされます。
- 行情報は 1 始まりの行番号で保存されます。

## 実装の要点

- コメント表示: `src/features/comment-decoration-manager.ts`
- コメント追加/送信: `src/features/line-comment-provider.ts`
- 拡張エントリ: `src/extension.ts`
- コメント保存: `src/features/comment-store.ts`

## 既存UIの整理

- CodeLens は未使用です。
- サイドビュー/パネル表示は削除済みです。
