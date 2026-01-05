import * as vscode from 'vscode';
import { getCurrentLineInfo, getEditorFileName, isDiffEditor } from './diff-editor-detector';
import { CommentInput, showCommentInput } from './comment-input-handler';
import { copyToClipboard } from './clipboard-manager';
import { Comment, formatStandardComment } from '../models/comment';
import { CommentStore } from './comment-store';
import { CommentDecorationManager } from './comment-decoration-manager';

export interface LineCommentProviderDependencies {
  showCommentInput: () => Promise<CommentInput | undefined>;
  copyToClipboard: (text: string) => Promise<boolean>;
  store: CommentStore;
  decorationManager: CommentDecorationManager;
}

export interface LineCommentProvider {
  addComment: () => Promise<void>;
  addCommentAtLine: (lineNumber: number, fileName: string) => Promise<void>;
  submitComments: () => Promise<void>;
}

export const createLineCommentProvider = (
  dependencies: LineCommentProviderDependencies
): LineCommentProvider => {
  const { showCommentInput, copyToClipboard, store, decorationManager } = dependencies;

  const addComment = async (): Promise<void> => {
    // 1. エディタ情報取得
    const lineInfo = getCurrentLineInfo();
    if (!lineInfo) {
      vscode.window.showWarningMessage('アクティブなエディタが見つかりません');
      return;
    }

    // 2. コメント入力
    const commentInput = await showCommentInput();
    if (!commentInput) {
      return; // ユーザーがキャンセル
    }

    // 3. フォーマット
    const comment: Comment = {
      fileName: lineInfo.fileName,
      lineNumber: lineInfo.lineNumber,
      text: commentInput.text,
      timestamp: commentInput.timestamp
    };

    const formattedComment = formatStandardComment(comment);

    // 4. 内部に保持して表示を更新
    store.add(comment);
    decorationManager.update(vscode.window.activeTextEditor);

    vscode.window.showInformationMessage(`コメントを追加しました: ${formattedComment}`);
  };

  const addCommentAtLine = async (
    lineNumber: number,
    fileName: string
  ): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('アクティブなエディタが見つかりません');
      return;
    }
    if (!isDiffEditor(editor)) {
      vscode.window.showWarningMessage('diff エディタで実行してください');
      return;
    }

    const currentFileName = getEditorFileName(editor);
    if (currentFileName !== fileName) {
      vscode.window.showWarningMessage('アクティブな diff が対象と一致しません');
      return;
    }

    const lineIndex = lineNumber - 1;
    if (lineIndex < 0 || lineIndex >= editor.document.lineCount) {
      vscode.window.showWarningMessage('指定した行が見つかりません');
      return;
    }

    const position = new vscode.Position(lineIndex, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));

    const commentInput = await showCommentInput();
    if (!commentInput) {
      return;
    }

    const comment: Comment = {
      fileName,
      lineNumber,
      text: commentInput.text,
      timestamp: commentInput.timestamp
    };

    const formattedComment = formatStandardComment(comment);

    store.add(comment);
    decorationManager.update(editor);

    vscode.window.showInformationMessage(`コメントを追加しました: ${formattedComment}`);
  };

  const submitComments = async (): Promise<void> => {
    if (!store.hasAny()) {
      vscode.window.showWarningMessage('送信するコメントがありません');
      return;
    }

    const formattedComments = store.formatAll();

    const success = await copyToClipboard(formattedComments);
    if (!success) {
      vscode.window.showErrorMessage('クリップボードへのコピーに失敗しました');
      return;
    }

    store.clear();
    decorationManager.update(vscode.window.activeTextEditor);

    vscode.window.showInformationMessage('コメントをまとめてコピーしました');
  };

  return {
    addComment,
    addCommentAtLine,
    submitComments
  };
};
