# Diff Comment

VS Code 上で行コメントを追加し、行末に表示してまとめてコピーできます。

## 機能

- アクティブエディタのファイル名と 1 始まりの行番号を記録
- コメント入力は標準の入力ボックス
- 行末にハイライト付きでコメントを表示
- 保存したコメントを一括でクリップボードにコピー

## 使い方

1. ファイルまたは diff ビューを開き、コメントしたい行にカーソルを置く
2. コマンドを実行:
   - コマンドパレット: `Diff Comment: Add Comment to Current Line`
   - ショートカット: `Ctrl+Shift+C` (macOS: `Cmd+Shift+C`)
3. コメントを入力して Enter
4. コメントが行末に表示される
5. まとめてコピーしたいとき:
   - コマンドパレット: `Diff Comment: Copy All Comments`
   - エディタのコンテキストメニュー: `Copy All Comments`
   - ショートカット: `Ctrl+Shift+Enter` (macOS: `Cmd+Shift+Enter`)
6. コピー後、保存済みコメントはクリアされる

## 出力フォーマット

```
src/extension.ts:42 check the initialization
```

## 要件

- Visual Studio Code 1.107.0 以上

## 開発

```bash
pnpm run compile
pnpm test
```
