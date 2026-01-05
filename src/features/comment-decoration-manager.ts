import * as vscode from "vscode";
import { CommentStore } from "./comment-store";
import { DiffEditorDetector } from "./diff-editor-detector";

export class CommentDecorationManager {
  private decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      margin: "0 0 0 1.2em",
      color: "#1f1f1f",
      backgroundColor: "rgba(255, 236, 150, 0.95)",
      border: "1px solid rgba(180, 150, 60, 0.95)",
      fontStyle: "normal",
    },
  });

  constructor(private store: CommentStore) {}

  update(editor?: vscode.TextEditor): void {
    if (!editor) {
      return;
    }

    const fileName = DiffEditorDetector.getEditorFileName(editor);
    const comments = this.store.listForFile(fileName);
    const byLine = new Map<number, string[]>();

    for (const comment of comments) {
      const existing = byLine.get(comment.lineNumber) ?? [];
      existing.push(comment.text);
      byLine.set(comment.lineNumber, existing);
    }

    const decorations: vscode.DecorationOptions[] = [];
    for (const [lineNumber, texts] of byLine) {
      const lineIndex = lineNumber - 1;
      if (lineIndex < 0 || lineIndex >= editor.document.lineCount) {
        continue;
      }

      const line = editor.document.lineAt(lineIndex);
      const contentText = `  ${texts.join(" | ")}`;

      decorations.push({
        range: new vscode.Range(
          lineIndex,
          line.range.end.character,
          lineIndex,
          line.range.end.character
        ),
        renderOptions: {
          after: {
            contentText,
          },
        },
      });
    }

    editor.setDecorations(this.decorationType, decorations);
  }

  dispose(): void {
    this.decorationType.dispose();
  }
}
