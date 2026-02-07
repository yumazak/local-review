import * as vscode from "vscode";

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await vscode.env.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

export const readFromClipboard = async (): Promise<string> => {
  try {
    return await vscode.env.clipboard.readText();
  } catch (error) {
    console.error("Failed to read from clipboard:", error);
    return "";
  }
};
