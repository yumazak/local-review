import * as vscode from "vscode";

export const showCommentInput = async (): Promise<string | undefined> => {
  const result = await vscode.window.showInputBox({
    prompt: "Add comment to line",
    placeHolder: "Enter your comment...",
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return "Please enter a comment";
      }
      return null;
    },
  });

  if (!result) {
    return undefined;
  }

  return result.trim();
};
