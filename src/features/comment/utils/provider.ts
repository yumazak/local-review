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
      vscode.window.showWarningMessage("No active editor found");
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
      vscode.window.showErrorMessage("Failed to copy to clipboard");
      return;
    }

    vscode.window.showInformationMessage(`Comment added: ${formattedComment}`);
  };

  const submitComments = async (): Promise<void> => {
    if (!store.hasAny()) {
      vscode.window.showWarningMessage("No comments to submit");
      return;
    }

    const formattedComments = store.formatAll();
    const success = await copyToClipboard(formattedComments);
    if (!success) {
      vscode.window.showErrorMessage("Failed to copy to clipboard");
      return;
    }

    store.clear();
    decorationManager.update(vscode.window.activeTextEditor);
    vscode.window.showInformationMessage("All comments copied to clipboard");
  };

  return { addComment, submitComments };
};
