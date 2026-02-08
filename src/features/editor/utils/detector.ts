import * as vscode from "vscode";

interface DiffEditorInfo {
  fileName: string;
  lineNumber: number;
  isDiffEditor: boolean;
}

export const getCurrentLineInfo = (): DiffEditorInfo | null => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;

  return {
    fileName: getEditorFileName(editor),
    lineNumber,
    isDiffEditor: isDiffEditor(editor),
  };
};

export const getEditorFileName = (editor: vscode.TextEditor): string => {
  const uri = editor.document.uri;
  const config = vscode.workspace.getConfiguration("localReview");
  const useAbsolutePath = config.get<boolean>("useAbsolutePath", false);

  if (useAbsolutePath) {
    if (uri.scheme === "file") {
      return uri.fsPath;
    }
    // git/diff スキームの場合は uri.path から絶対パスを取得
    if ((uri.scheme === "git" || uri.scheme === "diff") && uri.path) {
      return vscode.Uri.file(uri.path).fsPath;
    }
  }

  const isDiffScheme = isDiffEditor(editor);

  if (isDiffScheme && uri.path) {
    const fileUri = vscode.Uri.file(uri.path);
    return vscode.workspace.asRelativePath(fileUri, false);
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return vscode.workspace.asRelativePath(uri, false);
  }

  return editor.document.fileName;
};

const isDiffEditor = (editor: vscode.TextEditor): boolean => {
  const scheme = editor.document.uri.scheme;

  return scheme === "git" || scheme === "diff";
};
