import * as vscode from 'vscode';

export class ClipboardManager {
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await vscode.env.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  async readFromClipboard(): Promise<string> {
    try {
      return await vscode.env.clipboard.readText();
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return '';
    }
  }
}
