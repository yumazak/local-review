import * as assert from 'assert';
import * as vscode from 'vscode';
import { showCommentInput } from '../comment-input-handler';

suite('CommentInputHandler', () => {
  test('returns trimmed input with timestamp', async () => {
    const original = vscode.window.showInputBox;
    (vscode.window as unknown as {
      showInputBox: typeof vscode.window.showInputBox;
    }).showInputBox = async () => '  hello  ';

    try {
      const before = Date.now();
      const result = await showCommentInput();
      const after = Date.now();

      assert.ok(result);
      assert.strictEqual(result?.text, 'hello');
      assert.ok(result?.timestamp.getTime() >= before);
      assert.ok(result?.timestamp.getTime() <= after);
    } finally {
      (vscode.window as unknown as {
        showInputBox: typeof vscode.window.showInputBox;
      }).showInputBox = original;
    }
  });

  test('returns undefined when input is cancelled', async () => {
    const original = vscode.window.showInputBox;
    (vscode.window as unknown as {
      showInputBox: typeof vscode.window.showInputBox;
    }).showInputBox = async () => undefined;

    try {
      const result = await showCommentInput();
      assert.strictEqual(result, undefined);
    } finally {
      (vscode.window as unknown as {
        showInputBox: typeof vscode.window.showInputBox;
      }).showInputBox = original;
    }
  });
});
