import * as vscode from "vscode";

export interface CommentInputResult {
  text: string;
}

export const showCommentInput = async (): Promise<CommentInputResult | undefined> => {
  const text = await vscode.window.showInputBox({
    prompt: "Enter your review comment",
    placeHolder: "Type your comment here...",
    ignoreFocusOut: true,
  });

  if (!text?.trim()) {
    return undefined;
  }

  return { text: text.trim() };
};
