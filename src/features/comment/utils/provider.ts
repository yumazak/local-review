import * as vscode from "vscode";
import { getCurrentLineInfo } from "../../editor/utils/detector";
import { Comment } from "../types/comment";
import { formatStandardComment } from "./format";
import { CommentStore } from "./store";
import { CommentDecorationManager } from "./decoration";

interface LineCommentProviderDependencies {
  showCommentInput: () => Promise<string | undefined>;
  copyToClipboard: (text: string) => Promise<boolean>;
  store: CommentStore;
  decorationManager: CommentDecorationManager;
}

export const createLineCommentProvider = (dependencies: LineCommentProviderDependencies) => {
  const { showCommentInput, copyToClipboard, store, decorationManager } = dependencies;

  const addComment = async (): Promise<void> => {
    const lineInfo = getCurrentLineInfo();
    if (!lineInfo) {
      vscode.window.showWarningMessage("アクティブなエディタが見つかりません");
      return;
    }

    const text = await showCommentInput();
    if (!text) {
      return;
    }

    const comment: Comment = {
      fileName: lineInfo.fileName,
      lineNumber: lineInfo.lineNumber,
      text,
    };

    store.add(comment);
    decorationManager.update(vscode.window.activeTextEditor);

    const formattedComment = formatStandardComment(comment);
    const copied = await copyToClipboard(formattedComment);
    if (!copied) {
      vscode.window.showErrorMessage("クリップボードへのコピーに失敗しました");
      return;
    }

    vscode.window.showInformationMessage(`コメントを追加しました: ${formattedComment}`);
  };

  const submitComments = async (): Promise<void> => {
    if (!store.hasAny()) {
      vscode.window.showWarningMessage("送信するコメントがありません");
      return;
    }

    const formattedComments = store.formatAll();
    const success = await copyToClipboard(formattedComments);
    if (!success) {
      vscode.window.showErrorMessage("クリップボードへのコピーに失敗しました");
      return;
    }

    store.clear();
    decorationManager.update(vscode.window.activeTextEditor);
    vscode.window.showInformationMessage("コメントをまとめてコピーしました");
  };

  return { addComment, submitComments };
};
