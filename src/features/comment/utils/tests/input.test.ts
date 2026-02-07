import * as assert from "assert";
import * as vscode from "vscode";
import { showCommentInput } from "../input";

suite("CommentInputHandler", () => {
  test("returns trimmed input", async () => {
    const original = vscode.window.showInputBox;
    (
      vscode.window as unknown as {
        showInputBox: typeof vscode.window.showInputBox;
      }
    ).showInputBox = async () => "  hello  ";

    try {
      const result = await showCommentInput();
      assert.strictEqual(result, "hello");
    } finally {
      (
        vscode.window as unknown as {
          showInputBox: typeof vscode.window.showInputBox;
        }
      ).showInputBox = original;
    }
  });

  test("returns undefined when input is cancelled", async () => {
    const original = vscode.window.showInputBox;
    (
      vscode.window as unknown as {
        showInputBox: typeof vscode.window.showInputBox;
      }
    ).showInputBox = async () => undefined;

    try {
      const result = await showCommentInput();
      assert.strictEqual(result, undefined);
    } finally {
      (
        vscode.window as unknown as {
          showInputBox: typeof vscode.window.showInputBox;
        }
      ).showInputBox = original;
    }
  });
});
