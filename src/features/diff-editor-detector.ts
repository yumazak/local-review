import * as vscode from 'vscode';

export interface DiffEditorInfo {
  fileName: string;
  lineNumber: number;
  isDiffEditor: boolean;
}

export class DiffEditorDetector {
  static getCurrentLineInfo(): DiffEditorInfo | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    const position = editor.selection.active;
    const lineNumber = position.line + 1; // 0ベースから1ベースに変換

    return {
      fileName: this.getEditorFileName(editor),
      lineNumber,
      isDiffEditor: this.isDiffEditor(editor)
    };
  }

  static getEditorFileName(editor: vscode.TextEditor): string {
    const uri = editor.document.uri;
    const isDiffScheme = this.isDiffEditor(editor);

    if (isDiffScheme && uri.path) {
      const fileUri = vscode.Uri.file(uri.path);
      return vscode.workspace.asRelativePath(fileUri, false);
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      return vscode.workspace.asRelativePath(uri, false);
    }

    return editor.document.fileName;
  }

  static isDiffEditor(editor: vscode.TextEditor): boolean {
    const scheme = editor.document.uri.scheme;
    // git や diff スキームの場合は diff エディタ
    return scheme === 'git' || scheme === 'diff';
  }
}
