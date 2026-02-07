import * as vscode from "vscode";
import { Comment } from "../types/comment";
import { CommentStore } from "./store";
import { getEditorFileName } from "../../editor/utils/detector";

const groupCommentsByLine = (comments: Comment[]): Map<number, string[]> => {
  const byLine = new Map<number, string[]>();
  for (const comment of comments) {
    const existing = byLine.get(comment.lineNumber) ?? [];
    existing.push(comment.text);
    byLine.set(comment.lineNumber, existing);
  }
  return byLine;
};

const createDecorationOptions = (
  byLine: Map<number, string[]>,
  document: vscode.TextDocument,
): vscode.DecorationOptions[] => {
  const decorations: vscode.DecorationOptions[] = [];
  for (const [lineNumber, texts] of byLine) {
    const lineIndex = lineNumber - 1;
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
      renderOptions: { after: { contentText: `  ${texts.join(" | ")}` } },
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
    after: {
      margin: "0 0 0 1.2em",
      color: "#1f1f1f",
      backgroundColor: "rgba(255, 236, 150, 0.95)",
      border: "1px solid rgba(180, 150, 60, 0.95)",
      fontStyle: "normal",
    },
  });

  const update = (editor?: vscode.TextEditor): void => {
    if (!editor) {
      return;
    }

    const comments = store.listForFile(getEditorFileName(editor));
    const byLine = groupCommentsByLine(comments);
    const decorations = createDecorationOptions(byLine, editor.document);
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
