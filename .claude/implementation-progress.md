# VS Code 拡張機能実装進捗

## プロジェクト概要

**プロジェクト名**: Diff Comment
**目的**: VS Code の diff エディタで選択した行にコメントを追加し、「ファイル名:行番号 コメント内容」の形式でクリップボードにコピーする拡張機能を作成する

## ユーザー要件

- **保存方法**: クリップボードにコピー
- **対象**: 通常のテキスト比較（diff エディタ）
- **出力形式**: `ファイル名:行番号 コメント内容`
- **命名規則**: ファイル名はケバブケース（kebab-case）

## 実装状況

### ✅ 完了したタスク

1. **yo code でプロジェクトセットアップ** ✓
   - コマンド: `yo code . -t=ts -q --extensionDisplayName="Diff Comment" --extensionId="diff-comment"`
   - webpack バンドラー使用
   - npm パッケージマネージャー使用

2. **ディレクトリ構造作成** ✓
   ```
   src/
   ├── features/
   ├── models/
   └── ui/
   test/
   └── suite/
       └── features/
   ```

3. **Comment Model 実装** ✓
   - ファイル: `src/models/comment.ts`
   - `Comment` インターフェース定義
   - `CommentFormatter` クラス実装
   - フォーマット: `fileName:lineNumber text`

4. **ClipboardManager 実装** ✓
   - ファイル: `src/features/clipboard-manager.ts`
   - `copyToClipboard()` メソッド実装
   - `readFromClipboard()` メソッド実装（将来の拡張用）
   - エラーハンドリング実装

5. **DiffEditorDetector 実装** ✓
   - ファイル: `src/features/diff-editor-detector.ts`
   - `getCurrentLineInfo()` メソッド実装
   - エディタ情報取得（ファイル名、行番号）
   - 0ベース→1ベース行番号変換
   - ワークスペース相対パス取得
   - diff エディタ判定（git/diff スキーム）

### ✅ 完了したタスク（追加）

6. **CommentInputHandler と QuickInputBuilder 実装** ✓
   - ファイル: `src/features/comment-input-handler.ts`
   - ファイル: `src/ui/quick-input-builder.ts`
   - QuickInput API を使用したコメント入力UI
   - バリデーション（空白のみを拒否）

7. **LineCommentProvider 実装（内部保持対応）** ✓
   - ファイル: `src/features/line-comment-provider.ts`
   - コメントの内部保持、diff エディタ限定チェック、送信コマンド対応

8. **CommentStore / Decoration 実装** ✓
   - ファイル: `src/features/comment-store.ts`
   - ファイル: `src/features/comment-decoration-manager.ts`
   - コメントの内部保持と diff 行末表示

9. **extension.ts でコマンド登録** ✓
   - ファイル: `src/extension.ts`
   - コマンド `diff-comment.addComment` / `diff-comment.submitComments`
   - エディタ切替時の装飾更新

10. **package.json 設定** ✓
   - コマンド定義
   - キーバインド設定（Ctrl+Shift+C / Cmd+Shift+C）
   - コンテキストメニュー追加
   - 送信コマンド追加

11. **テスト作成** ✓
    - `src/test/features/comment.test.ts`
    - `src/test/features/diff-editor-detector.test.ts`
    - `src/test/features/clipboard-manager.test.ts`
    - `src/test/features/comment-store.test.ts`
    - `src/test/extension.test.ts`

12. **README.md 更新** ✓
    - 使い方ドキュメント
    - 出力例
    - 一括コピーの説明

13. **diff エディタの相対パス対応** ✓
    - `src/features/diff-editor-detector.ts`

### ⏳ 残りのタスク

14. **動作確認（F5 でデバッグ実行）**

## 次のステップの詳細

### 6. CommentInputHandler と QuickInputBuilder 実装

#### QuickInputBuilder (`src/ui/quick-input-builder.ts`)

```typescript
import * as vscode from 'vscode';

export class QuickInputBuilder {
  public static async showCommentInput(): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
      prompt: '行にコメントを追加',
      placeHolder: 'コメントを入力してください...',
      validateInput: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'コメントを入力してください';
        }
        return null;
      }
    });

    return result;
  }
}
```

#### CommentInputHandler (`src/features/comment-input-handler.ts`)

```typescript
import { QuickInputBuilder } from '../ui/quick-input-builder';

export interface CommentInput {
  text: string;
  timestamp: Date;
}

export class CommentInputHandler {
  public async showCommentInput(): Promise<CommentInput | undefined> {
    const text = await QuickInputBuilder.showCommentInput();

    if (!text) {
      return undefined;
    }

    return {
      text: text.trim(),
      timestamp: new Date()
    };
  }
}
```

### 7. LineCommentProvider 実装 (`src/features/line-comment-provider.ts`)

```typescript
import * as vscode from 'vscode';
import { DiffEditorDetector } from './diff-editor-detector';
import { CommentInputHandler } from './comment-input-handler';
import { ClipboardManager } from './clipboard-manager';
import { Comment, CommentFormatter } from '../models/comment';

export class LineCommentProvider {
  constructor(
    private inputHandler: CommentInputHandler,
    private clipboardManager: ClipboardManager
  ) {}

  public async addComment(): Promise<void> {
    // 1. エディタ情報取得
    const lineInfo = DiffEditorDetector.getCurrentLineInfo();
    if (!lineInfo) {
      vscode.window.showWarningMessage('アクティブなエディタが見つかりません');
      return;
    }

    // 2. コメント入力
    const commentInput = await this.inputHandler.showCommentInput();
    if (!commentInput) {
      return; // ユーザーがキャンセル
    }

    // 3. フォーマット
    const comment: Comment = {
      fileName: lineInfo.fileName,
      lineNumber: lineInfo.lineNumber,
      text: commentInput.text,
      timestamp: commentInput.timestamp
    };

    const formattedComment = CommentFormatter.formatStandard(comment);

    // 4. クリップボードにコピー
    const success = await this.clipboardManager.copyToClipboard(formattedComment);
    if (!success) {
      vscode.window.showErrorMessage('クリップボードへのコピーに失敗しました');
      return;
    }

    // 5. 成功通知
    vscode.window.showInformationMessage(`コピーしました: ${formattedComment}`);
  }
}
```

### 8. extension.ts でコマンド登録

```typescript
import * as vscode from 'vscode';
import { LineCommentProvider } from './features/line-comment-provider';
import { CommentInputHandler } from './features/comment-input-handler';
import { ClipboardManager } from './features/clipboard-manager';

export function activate(context: vscode.ExtensionContext) {
  console.log('Diff Comment extension is now active');

  // 依存関係の構築
  const clipboardManager = new ClipboardManager();
  const inputHandler = new CommentInputHandler();
  const commentProvider = new LineCommentProvider(inputHandler, clipboardManager);

  // コマンドの登録
  const disposable = vscode.commands.registerCommand(
    'diff-comment.addComment',
    async () => {
      try {
        await commentProvider.addComment();
      } catch (error) {
        vscode.window.showErrorMessage(`コメントの追加に失敗しました: ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // クリーンアップ処理
}
```

### 9. package.json 設定

既存の package.json に以下を追加：

```json
{
  "contributes": {
    "commands": [
      {
        "command": "diff-comment.addComment",
        "title": "Add Comment to Current Line",
        "category": "Diff Comment"
      }
    ],
    "keybindings": [
      {
        "command": "diff-comment.addComment",
        "key": "ctrl+shift+c",
        "mac": "cmd+shift+c",
        "when": "editorTextFocus"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "diff-comment.addComment",
          "group": "9_cutcopypaste",
          "when": "editorTextFocus"
        }
      ]
    }
  }
}
```

### 10. テスト作成

#### ユニットテスト

- `test/suite/features/diff-editor-detector.test.ts` - エディタ情報取得のテスト
- `test/suite/features/clipboard-manager.test.ts` - クリップボード操作のテスト
- `test/suite/models/comment.test.ts` - フォーマッターのテスト

#### 統合テスト

- `test/suite/features/line-comment-provider.test.ts` - メインフロー全体のテスト

#### E2Eテスト

- `test/suite/extension.test.ts` - 拡張機能の起動とコマンド登録のテスト

### 11. README.md 作成

```markdown
# Diff Comment

VS Codeのdiffエディタで行にコメントを追加し、クリップボードにコピーする拡張機能です。

## 機能

- diffエディタ（または通常のエディタ）で現在の行にコメントを追加
- コメントを `ファイル名:行番号 コメント内容` の形式でクリップボードにコピー
- キーボードショートカットまたはコンテキストメニューから実行可能

## 使い方

1. コメントを追加したい行にカーソルを移動
2. 以下のいずれかの方法でコマンドを実行:
   - キーボードショートカット: `Ctrl+Shift+C` (Mac: `Cmd+Shift+C`)
   - コマンドパレット: `Diff Comment: Add Comment to Current Line`
   - 右クリックメニュー: `Add Comment to Current Line`
3. コメントを入力して Enter
4. フォーマットされたコメントがクリップボードにコピーされます

## 出力フォーマット

```
src/extension.ts:42 このファイルの初期化処理を確認
```

## 要件

- Visual Studio Code 1.85.0 以降
```

## 作成済みファイル一覧

```
/Users/yumazak/dev/personal/local-review/
├── src/
│   ├── extension.ts (yo code で生成、後で更新予定)
│   ├── features/
│   │   ├── clipboard-manager.ts ✓
│   │   └── diff-editor-detector.ts ✓
│   ├── models/
│   │   └── comment.ts ✓
│   └── ui/ (空)
├── test/
│   └── suite/
│       └── features/ (空)
├── package.json (yo code で生成、後で更新予定)
├── tsconfig.json
├── webpack.config.js
└── README.md (yo code で生成、後で更新予定)
```

## 技術的なポイント

### エディタ情報の取得

```typescript
const editor = vscode.window.activeTextEditor;
const lineNumber = editor.selection.active.line + 1;  // 0ベース→1ベース
const fileName = vscode.workspace.asRelativePath(editor.document.uri);
```

### QuickInput の使用理由

- WebView より軽量
- VS Code のネイティブなルック&フィール
- シンプルなテキスト入力に最適

### エラーハンドリング戦略

- 早期リターンパターンを使用
- エディタがない場合は警告メッセージ
- ユーザーキャンセルは静かに終了
- クリップボードエラーはエラーメッセージ表示

## 開発コマンド

```bash
# ビルド
npm run compile

# Watch モード
npm run watch

# テスト実行
npm test

# デバッグ
# F5 キーを押して拡張機能開発ホストを起動
```

## 次のセッションで実行すべきこと

1. QuickInputBuilder を実装 (`src/ui/quick-input-builder.ts`)
2. CommentInputHandler を実装 (`src/features/comment-input-handler.ts`)
3. LineCommentProvider を実装 (`src/features/line-comment-provider.ts`)
4. extension.ts を更新してコマンドを登録
5. package.json を更新してコマンド、キーバインド、メニューを追加
6. テストを作成
7. README.md を更新
8. 動作確認（F5 でデバッグ実行）

## 参考リンク

- [VS Code Extension API](https://code.visualstudio.com/api/references/vscode-api)
- [Extension Capabilities](https://code.visualstudio.com/api/extension-capabilities/overview)
- [UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview)
