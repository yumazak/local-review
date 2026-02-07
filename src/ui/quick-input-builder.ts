import * as vscode from "vscode";

export const showCommentInput = async (): Promise<string | undefined> => {
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
