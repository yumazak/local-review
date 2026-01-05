import * as assert from 'assert';
import * as vscode from 'vscode';
import { createCommentDecorationManager } from '../comment-decoration-manager';
import { createCommentStore } from '../../../comment-store/utils/comment-store';

suite('CommentDecorationManager', () => {
  test('update renders joined comments per line', async () => {
    const store = createCommentStore();
    const manager = createCommentDecorationManager(store);
    const document = await vscode.workspace.openTextDocument({
      content: 'first line\nsecond line'
    });
    const editor = await vscode.window.showTextDocument(document);

    const captured: vscode.DecorationOptions[] = [];
    const originalSetDecorations = editor.setDecorations.bind(editor);
    (editor as unknown as {
      setDecorations: (
        type: vscode.TextEditorDecorationType,
        decorations: vscode.DecorationOptions[]
      ) => void;
    }).setDecorations = (_type, decorations) => {
      captured.splice(0, captured.length, ...decorations);
    };

    const fileName = document.fileName;
    store.add({
      fileName,
      lineNumber: 1,
      text: 'a',
      timestamp: new Date()
    });
    store.add({
      fileName,
      lineNumber: 1,
      text: 'b',
      timestamp: new Date()
    });
    store.add({
      fileName,
      lineNumber: 2,
      text: 'c',
      timestamp: new Date()
    });
    store.add({
      fileName,
      lineNumber: 99,
      text: 'out',
      timestamp: new Date()
    });

    manager.update(editor);

    assert.strictEqual(captured.length, 2);
    assert.strictEqual(captured[0].renderOptions?.after?.contentText, '  a | b');
    assert.strictEqual(captured[1].renderOptions?.after?.contentText, '  c');

    (editor as unknown as { setDecorations: typeof editor.setDecorations }).setDecorations =
      originalSetDecorations;
    manager.dispose();
  });
});
