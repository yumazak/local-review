import * as vscode from "vscode";
import { showCommentInput } from "./features/comment/utils/input";
import { copyToClipboard } from "./features/clipboard/utils/clipboard-manager";
import { createCommentStore } from "./features/comment/utils/store";
import { createCommentDecorationManager } from "./features/comment/utils/decoration";
import type { CommentContext } from "./features/comment/types/context";
import { addComment, submitComments } from "./features/comment/utils/actions";

export function activate(context: vscode.ExtensionContext) {
  console.log("Local Review extension is now active");

  // Initialize context
  const store = createCommentStore();
  const decorationManager = createCommentDecorationManager(store);

  const ctx: CommentContext = {
    store,
    decorationManager,
    showCommentInput,
    copyToClipboard,
  };

  // Register commands
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
      decorationManager.update(editor);
    }),
    decorationManager,
  );
}

export function deactivate() {
  // Cleanup
}
