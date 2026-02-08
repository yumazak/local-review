import * as vscode from "vscode";
import type { CommentAction } from "../types/context";
import { getCurrentLineInfo } from "../../editor/utils/detector";

export const addComment: CommentAction = async (ctx) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor found");
    return;
  }

  const lineInfo = getCurrentLineInfo();
  if (!lineInfo) {
    vscode.window.showWarningMessage("No active editor found");
    return;
  }

  await ctx.commentProvider.startCommentAtLine(editor.document.uri, lineInfo.lineNumber);
};

export const submitComments: CommentAction = async (ctx) => {
  if (!ctx.store.hasAny()) {
    vscode.window.showWarningMessage("No comments to submit");
    return;
  }

  const formattedComments = ctx.store.formatAll();
  const success = await ctx.copyToClipboard(formattedComments);
  if (!success) {
    vscode.window.showErrorMessage("Failed to copy to clipboard");
    return;
  }

  ctx.store.clear();
  ctx.commentProvider.clearAllThreads();
  vscode.window.showInformationMessage("All comments copied to clipboard");
};
