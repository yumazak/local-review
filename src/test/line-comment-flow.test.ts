import * as assert from "assert";
import * as vscode from "vscode";
import { createCommentStore } from "../features/comment/utils/store";
import type { CommentDecorationManager } from "../features/comment/utils/decoration";
import { formatStandardComment } from "../features/comment/utils/format";
import type { CommentContext } from "../features/comment/types/context";
import { addComment, submitComments } from "../features/comment/utils/actions";

suite("Line Comment Flow", () => {
  const createMockDecorationManager = (updates: vscode.TextEditor[]): CommentDecorationManager => ({
    update: (editor?: vscode.TextEditor) => {
      if (editor) {
        updates.push(editor);
      }
    },
    dispose: () => {},
  });

  test("add comment then submit copies and clears", async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];
    const copiedTexts: string[] = [];

    const ctx: CommentContext = {
      showCommentInput: async () => "needs check",
      copyToClipboard: async (text: string) => {
        copiedTexts.push(text);
        return true;
      },
      store,
      decorationManager: createMockDecorationManager(updates),
    };

    const document = await vscode.workspace.openTextDocument({
      content: "first line\nsecond line",
    });
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0));

    await addComment(ctx);

    const comments = store.list();
    assert.strictEqual(comments.length, 1);
    assert.strictEqual(comments[0].text, "needs check");
    assert.strictEqual(comments[0].lineNumber, 0);
    assert.strictEqual(comments[0].fileName, editor.document.fileName);
    assert.strictEqual(copiedTexts.length, 1);
    assert.strictEqual(copiedTexts[0], formatStandardComment(comments[0]));
    const expectedCopy = store.formatAll();

    await submitComments(ctx);

    assert.strictEqual(copiedTexts.length, 2);
    assert.strictEqual(copiedTexts[1], expectedCopy);
    assert.strictEqual(store.hasAny(), false);
    assert.strictEqual(updates.length, 2);
  });

  test("addComment does nothing when showCommentInput returns undefined", async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];
    const copiedTexts: string[] = [];

    const ctx: CommentContext = {
      showCommentInput: async () => undefined,
      copyToClipboard: async (text: string) => {
        copiedTexts.push(text);
        return true;
      },
      store,
      decorationManager: createMockDecorationManager(updates),
    };

    const document = await vscode.workspace.openTextDocument({
      content: "first line\nsecond line",
    });
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0));

    await addComment(ctx);

    assert.strictEqual(store.list().length, 0);
    assert.strictEqual(copiedTexts.length, 0);
    assert.strictEqual(updates.length, 0);
  });

  test("addComment adds to store but shows error when copyToClipboard fails", async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];

    const ctx: CommentContext = {
      showCommentInput: async () => "test comment",
      copyToClipboard: async () => false,
      store,
      decorationManager: createMockDecorationManager(updates),
    };

    const document = await vscode.workspace.openTextDocument({
      content: "first line\nsecond line",
    });
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0));

    await addComment(ctx);

    assert.strictEqual(store.list().length, 1);
    assert.strictEqual(updates.length, 1);
  });

  test("submitComments does nothing when store is empty", async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];
    const copiedTexts: string[] = [];

    const ctx: CommentContext = {
      showCommentInput: async () => "test",
      copyToClipboard: async (text: string) => {
        copiedTexts.push(text);
        return true;
      },
      store,
      decorationManager: createMockDecorationManager(updates),
    };

    await submitComments(ctx);

    assert.strictEqual(copiedTexts.length, 0);
    assert.strictEqual(updates.length, 0);
  });

  test("submitComments keeps comments when copyToClipboard fails", async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];

    store.add({ fileName: "test.ts", lineNumber: 0, text: "comment" });

    const ctx: CommentContext = {
      showCommentInput: async () => "test",
      copyToClipboard: async () => false,
      store,
      decorationManager: createMockDecorationManager(updates),
    };

    await submitComments(ctx);

    assert.strictEqual(store.list().length, 1);
    assert.strictEqual(updates.length, 0);
  });
});
