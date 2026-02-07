import * as vscode from "vscode";
import { Comment } from "../types/comment";
import { CommentStore } from "./store";
import { getEditorFileName } from "../../editor/utils/detector";

const COMMENT_DECORATION_STYLE: vscode.DecorationRenderOptions["after"] = {
  margin: "0 0 0 1.2em",
  color: "#1f1f1f",
  backgroundColor: "rgba(255, 236, 150, 0.95)",
  border: "1px solid rgba(180, 150, 60, 0.95)",
  fontStyle: "normal",
};

const createDecorationOptions = (
  comments: Comment[],
  document: vscode.TextDocument,
): vscode.DecorationOptions[] => {
  const decorations: vscode.DecorationOptions[] = [];
  for (const comment of comments) {
    const lineIndex = comment.lineNumber;
    if (lineIndex < 0 || lineIndex >= document.lineCount) {
      continue;
    }
    const line = document.lineAt(lineIndex);
    decorations.push({
      range: new vscode.Range(
        lineIndex,
        line.range.end.character,
        lineIndex,
        line.range.end.character,
      ),
      renderOptions: { after: { contentText: `  ${comment.text}` } },
    });
  }
  return decorations;
};

export interface CommentDecorationManager {
  update: (editor?: vscode.TextEditor) => void;
  dispose: () => void;
}

export const createCommentDecorationManager = (store: CommentStore): CommentDecorationManager => {
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: COMMENT_DECORATION_STYLE,
  });

  const update = (editor?: vscode.TextEditor): void => {
    if (!editor) {
      return;
    }

    const comments = store.listForFile(getEditorFileName(editor));
    const decorations = createDecorationOptions(comments, editor.document);
    editor.setDecorations(decorationType, decorations);
  };

  const dispose = (): void => {
    decorationType.dispose();
  };

  return {
    update,
    dispose,
  };
};
