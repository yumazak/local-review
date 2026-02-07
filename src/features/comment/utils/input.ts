import * as vscode from "vscode";

export interface CommentInput {
  text: string;
  timestamp: Date;
}

const showQuickInput = async (): Promise<string | undefined> => {
  const result = await vscode.window.showInputBox({
    prompt: "行にコメントを追加",
    placeHolder: "コメントを入力してください...",
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return "コメントを入力してください";
      }
      return null;
    },
  });

  return result;
};

export const showCommentInput = async (): Promise<CommentInput | undefined> => {
  const text = await showQuickInput();

  if (!text) {
    return undefined;
  }

  return {
    text: text.trim(),
    timestamp: new Date(),
  };
};
