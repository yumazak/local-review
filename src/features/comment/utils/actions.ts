import * as vscode from "vscode";
import type { CommentAction } from "../types/context";
import type { Comment } from "../types/comment";
import { getCurrentLineInfo } from "../../editor/utils/detector";
import { formatStandardComment } from "./format";

export const addComment: CommentAction = async (ctx) => {
  const lineInfo = getCurrentLineInfo();
  if (!lineInfo) {
    vscode.window.showWarningMessage("No active editor found");
    return;
  }

  const text = await ctx.showCommentInput();
  if (!text) {
    return;
  }

  const comment: Comment = {
    fileName: lineInfo.fileName,
    lineNumber: lineInfo.lineNumber,
    text,
  };

  ctx.store.add(comment);
  ctx.decorationManager.update(vscode.window.activeTextEditor);

  const formattedComment = formatStandardComment(comment);
  const copied = await ctx.copyToClipboard(formattedComment);
  if (!copied) {
    vscode.window.showErrorMessage("Failed to copy to clipboard");
    return;
  }

  vscode.window.showInformationMessage(`Comment added: ${formattedComment}`);
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
  ctx.decorationManager.update(vscode.window.activeTextEditor);
  vscode.window.showInformationMessage("All comments copied to clipboard");
};
