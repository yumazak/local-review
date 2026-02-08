import * as vscode from "vscode";
import type { Comment } from "../types/comment";
import type { CommentStore } from "./store";
import { getEditorFileName } from "../../editor/utils/detector";
import { formatStandardComment } from "./format";
import type { CommentInputResult } from "./input";

class ReviewComment implements vscode.Comment {
  public body: string | vscode.MarkdownString;
  public mode: vscode.CommentMode;
  public author: vscode.CommentAuthorInformation;

  constructor(public comment: Comment) {
    this.body = new vscode.MarkdownString(comment.text);
    this.mode = vscode.CommentMode.Preview;
    this.author = { name: "" };
  }
}

export interface CommentProvider {
  startCommentAtLine(uri: vscode.Uri, line: number): Promise<void>;
  refreshForEditor(editor?: vscode.TextEditor): void;
  clearAllThreads(): void;
  dispose(): void;
}

export const createCommentProvider = (
  store: CommentStore,
  context: vscode.ExtensionContext,
  showCommentInput: () => Promise<CommentInputResult | undefined>,
  copyToClipboard: (text: string) => Promise<boolean>,
): CommentProvider => {
  const commentController = vscode.comments.createCommentController("localReview", "Local Review");

  const threads = new Map<string, vscode.CommentThread[]>();

  const getThreadKey = (uri: vscode.Uri): string => {
    return uri.toString();
  };

  const clearThreadsForFile = (uri: vscode.Uri): void => {
    const key = getThreadKey(uri);
    const fileThreads = threads.get(key);
    if (fileThreads) {
      for (const thread of fileThreads) {
        thread.dispose();
      }
      threads.delete(key);
    }
  };

  const removeThreadFromMap = (thread: vscode.CommentThread): void => {
    const key = getThreadKey(thread.uri);
    const fileThreads = threads.get(key);
    if (fileThreads) {
      const index = fileThreads.indexOf(thread);
      if (index !== -1) {
        fileThreads.splice(index, 1);
      }
    }
  };

  // コメント削除コマンド
  const deleteCommentCommand = vscode.commands.registerCommand(
    "localReview.deleteComment",
    (thread: vscode.CommentThread) => {
      if (!thread.range) {
        thread.dispose();
        return;
      }
      const line = thread.range.start.line;
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const fileName = getEditorFileName(editor);
        store.removeAt(fileName, line);
      }
      removeThreadFromMap(thread);
      thread.dispose();
    },
  );

  context.subscriptions.push(deleteCommentCommand);

  const startCommentAtLine = async (uri: vscode.Uri, line: number): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    const fileName = editor ? getEditorFileName(editor) : uri.fsPath;

    const result = await showCommentInput();
    if (!result) {
      return;
    }

    const comment: Comment = {
      fileName,
      lineNumber: line,
      text: result.text,
    };

    store.add(comment);

    // CommentThread を作成して表示
    const range = new vscode.Range(line, 0, line, 0);
    const thread = commentController.createCommentThread(uri, range, []);

    const reviewComment = new ReviewComment(comment);
    thread.comments = [reviewComment];
    thread.canReply = false;
    thread.label = "Local Review";
    thread.contextValue = "localReviewThread";
    thread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;

    const key = getThreadKey(uri);
    const fileThreads = threads.get(key) || [];
    fileThreads.push(thread);
    threads.set(key, fileThreads);

    // 設定に基づきクリップボードにコピー
    const config = vscode.workspace.getConfiguration("localReview");
    const copyOnComment = config.get<boolean>("copyOnComment", true);

    if (copyOnComment) {
      const formattedComment = formatStandardComment(comment);
      const copied = await copyToClipboard(formattedComment);
      if (copied) {
        vscode.window.showInformationMessage(`Comment added: ${formattedComment}`);
      }
    } else {
      vscode.window.showInformationMessage("Comment added");
    }
  };

  const refreshForEditor = (editor?: vscode.TextEditor): void => {
    if (!editor) {
      return;
    }

    const uri = editor.document.uri;
    clearThreadsForFile(uri);

    const fileName = getEditorFileName(editor);
    const comments = store.listForFile(fileName);

    const fileThreads: vscode.CommentThread[] = [];

    for (const comment of comments) {
      const cLine = comment.lineNumber;
      if (cLine < 0 || cLine >= editor.document.lineCount) {
        continue;
      }

      const range = new vscode.Range(cLine, 0, cLine, 0);
      const thread = commentController.createCommentThread(uri, range, []);

      const reviewComment = new ReviewComment(comment);
      thread.comments = [reviewComment];
      thread.canReply = false;
      thread.label = "Local Review";
      thread.contextValue = "localReviewThread";
      thread.collapsibleState = vscode.CommentThreadCollapsibleState.Collapsed;

      fileThreads.push(thread);
    }

    threads.set(getThreadKey(uri), fileThreads);
  };

  const clearAllThreads = (): void => {
    for (const fileThreads of threads.values()) {
      for (const thread of fileThreads) {
        thread.dispose();
      }
    }
    threads.clear();
  };

  const dispose = (): void => {
    clearAllThreads();
    commentController.dispose();
  };

  return {
    startCommentAtLine,
    refreshForEditor,
    clearAllThreads,
    dispose,
  };
};
