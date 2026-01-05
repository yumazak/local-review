import * as assert from 'assert';
import * as vscode from 'vscode';
import { getCurrentLineInfo } from '../diff-editor-detector';

suite('DiffEditorDetector', () => {
  test('getCurrentLineInfo returns line info for active editor', async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'first line\nsecond line'
    });
    const editor = await vscode.window.showTextDocument(document);

    editor.selection = new vscode.Selection(
      new vscode.Position(1, 0),
      new vscode.Position(1, 0)
    );

    const info = getCurrentLineInfo();

    assert.ok(info);
    assert.strictEqual(info?.lineNumber, 2);
    assert.strictEqual(info?.isDiffEditor, false);
  });
});
