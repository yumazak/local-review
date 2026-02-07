import * as assert from "assert";
import * as vscode from "vscode";
import { createCommentDecorationManager } from "../decoration";
import { createCommentStore } from "../store";

suite("CommentDecorationManager", () => {
  // VS Code の TextEditor.setDecorations は再定義不可のため、
  // モックでのテストが困難。実際の動作確認は E2E で行う。
  test.skip("update renders joined comments per line", async () => {
    const store = createCommentStore();
    const manager = createCommentDecorationManager(store);
    const document = await vscode.workspace.openTextDocument({
      content: "first line\nsecond line",
    });
    const editor = await vscode.window.showTextDocument(document);

    const captured: vscode.DecorationOptions[] = [];

    const fileName = document.fileName;
    store.add({
      fileName,
      lineNumber: 1,
      text: "a",
      timestamp: new Date(),
    });
    store.add({
      fileName,
      lineNumber: 1,
      text: "b",
      timestamp: new Date(),
    });
    store.add({
      fileName,
      lineNumber: 2,
      text: "c",
      timestamp: new Date(),
    });
    store.add({
      fileName,
      lineNumber: 99,
      text: "out",
      timestamp: new Date(),
    });

    manager.update(editor);

    assert.strictEqual(captured.length, 2);
    assert.strictEqual(captured[0].renderOptions?.after?.contentText, "  a | b");
    assert.strictEqual(captured[1].renderOptions?.after?.contentText, "  c");

    manager.dispose();
  });
});
