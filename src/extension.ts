import * as vscode from "vscode";
import { copyToClipboard } from "./features/clipboard/utils/clipboard-manager";
import { createCommentStore } from "./features/comment/utils/store";
import { createCommentProvider } from "./features/comment/utils/provider";
import { showCommentInput } from "./features/comment/utils/input";
import type { CommentContext } from "./features/comment/types/context";
import { addComment, submitComments } from "./features/comment/utils/actions";

export function activate(context: vscode.ExtensionContext) {
  console.log("Local Review extension is now active");

  const store = createCommentStore();
  const commentProvider = createCommentProvider(store, context, showCommentInput, copyToClipboard);

  const ctx: CommentContext = {
    store,
    commentProvider,
    showCommentInput,
    copyToClipboard,
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("local-review.addComment", async () => {
      try {
        await addComment(ctx);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to add comment: ${error}`);
      }
    }),
    vscode.commands.registerCommand("local-review.submitComments", async () => {
      try {
        await submitComments(ctx);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to submit comments: ${error}`);
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      commentProvider.refreshForEditor(editor);
    }),
    { dispose: () => commentProvider.dispose() },
  );
}

export function deactivate() {
  // Cleanup
}
