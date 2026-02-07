import * as assert from "assert";
import * as vscode from "vscode";
import { createCommentDecorationManager } from "../decoration";
import { createCommentStore } from "../store";

suite("CommentDecorationManager", () => {
  // TextEditor.setDecorations cannot be redefined, making mock testing difficult.
  // Verify behavior via E2E tests.
  test.skip("update renders joined comments per line", async () => {
    const store = createCommentStore();
    const manager = createCommentDecorationManager(store);
    const document = await vscode.workspace.openTextDocument({
      content: "first line\nsecond line",
    });
    const editor = await vscode.window.showTextDocument(document);

    const captured: vscode.DecorationOptions[] = [];

    const fileName = document.fileName;
    store.add({ fileName, lineNumber: 1, text: "a" });
    store.add({ fileName, lineNumber: 1, text: "b" });
    store.add({ fileName, lineNumber: 2, text: "c" });
    store.add({ fileName, lineNumber: 99, text: "out" });

    manager.update(editor);

    assert.strictEqual(captured.length, 2);
    assert.strictEqual(captured[0].renderOptions?.after?.contentText, "  a | b");
    assert.strictEqual(captured[1].renderOptions?.after?.contentText, "  c");

    manager.dispose();
  });
});
