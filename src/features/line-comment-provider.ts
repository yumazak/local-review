import * as vscode from 'vscode';
import { DiffEditorDetector } from './diff-editor-detector';
import { CommentInputHandler } from './comment-input-handler';
import { ClipboardManager } from './clipboard-manager';
import { Comment, CommentFormatter } from '../models/comment';
import { CommentStore } from './comment-store';
import { CommentDecorationManager } from './comment-decoration-manager';

export class LineCommentProvider {
  constructor(
    private inputHandler: CommentInputHandler,
    private clipboardManager: ClipboardManager,
    private store: CommentStore,
    private decorationManager: CommentDecorationManager
  ) {}

  public async addComment(): Promise<void> {
    // 1. エディタ情報取得
    const lineInfo = DiffEditorDetector.getCurrentLineInfo();
    if (!lineInfo) {
      vscode.window.showWarningMessage('アクティブなエディタが見つかりません');
      return;
    }

    // 2. コメント入力
    const commentInput = await this.inputHandler.showCommentInput();
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

    const formattedComment = CommentFormatter.formatStandard(comment);

    // 4. 内部に保持して表示を更新
    this.store.add(comment);
    this.decorationManager.update(vscode.window.activeTextEditor);

    vscode.window.showInformationMessage(`コメントを追加しました: ${formattedComment}`);
  }

  public async addCommentAtLine(lineNumber: number, fileName: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('アクティブなエディタが見つかりません');
      return;
    }
    if (!DiffEditorDetector.isDiffEditor(editor)) {
      vscode.window.showWarningMessage('diff エディタで実行してください');
      return;
    }

    const currentFileName = DiffEditorDetector.getEditorFileName(editor);
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

    const commentInput = await this.inputHandler.showCommentInput();
    if (!commentInput) {
      return;
    }

    const comment: Comment = {
      fileName,
      lineNumber,
      text: commentInput.text,
      timestamp: commentInput.timestamp
    };

    const formattedComment = CommentFormatter.formatStandard(comment);

    this.store.add(comment);
    this.decorationManager.update(editor);

    vscode.window.showInformationMessage(`コメントを追加しました: ${formattedComment}`);
  }

  public async submitComments(): Promise<void> {
    if (!this.store.hasAny()) {
      vscode.window.showWarningMessage('送信するコメントがありません');
      return;
    }

    const formattedComments = this.store.formatAll();

    const success = await this.clipboardManager.copyToClipboard(formattedComments);
    if (!success) {
      vscode.window.showErrorMessage('クリップボードへのコピーに失敗しました');
      return;
    }

    this.store.clear();
    this.decorationManager.update(vscode.window.activeTextEditor);

    vscode.window.showInformationMessage('コメントをまとめてコピーしました');
  }
}
