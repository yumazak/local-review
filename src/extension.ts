import * as vscode from "vscode";
import { createLineCommentProvider } from "./features/line-comment/utils/line-comment-provider";
import { showCommentInput } from "./features/comment-input/utils/comment-input-handler";
import { copyToClipboard } from "./features/clipboard/utils/clipboard-manager";
import { createCommentStore } from "./features/comment-store/utils/comment-store";
import { createCommentDecorationManager } from "./features/comment-decoration/utils/comment-decoration-manager";

export function activate(context: vscode.ExtensionContext) {
  console.log("Diff Comment extension is now active");

  // 依存関係の構築
  const store = createCommentStore();
  const decorationManager = createCommentDecorationManager(store);
  const commentProvider = createLineCommentProvider({
    showCommentInput,
    copyToClipboard,
    store,
    decorationManager,
  });

  // コマンドの登録
  const addCommentCommand = vscode.commands.registerCommand("diff-comment.addComment", async () => {
    try {
      await commentProvider.addComment();
    } catch (error) {
      vscode.window.showErrorMessage(`コメントの追加に失敗しました: ${error}`);
    }
  });

  const submitCommentsCommand = vscode.commands.registerCommand(
    "diff-comment.submitComments",
    async () => {
      try {
        await commentProvider.submitComments();
      } catch (error) {
        vscode.window.showErrorMessage(`コメントの送信に失敗しました: ${error}`);
      }
    },
  );

  const addCommentAtLineCommand = vscode.commands.registerCommand(
    "diff-comment.addCommentAtLine",
    async (lineNumber: number, fileName: string) => {
      try {
        await commentProvider.addCommentAtLine(lineNumber, fileName);
      } catch (error) {
        vscode.window.showErrorMessage(`コメントの追加に失敗しました: ${error}`);
      }
    },
  );
  const editorChangeSubscription = vscode.window.onDidChangeActiveTextEditor((editor) => {
    decorationManager.update(editor);
  });

  context.subscriptions.push(
    addCommentCommand,
    submitCommentsCommand,
    addCommentAtLineCommand,
    editorChangeSubscription,
    decorationManager,
  );
}

export function deactivate() {
  // クリーンアップ処理
}
