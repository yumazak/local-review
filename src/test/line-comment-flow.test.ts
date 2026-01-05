import * as assert from 'assert';
import * as vscode from 'vscode';
import { createLineCommentProvider } from '../features/line-comment/utils/line-comment-provider';
import { createCommentStore } from '../features/comment-store/utils/comment-store';
import { CommentDecorationManager } from '../features/comment-decoration/utils/comment-decoration-manager';

suite('Line Comment Flow', () => {
  test('add comment then submit copies and clears', async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];
    let copiedText = '';

    const decorationManager: CommentDecorationManager = {
      update: (editor?: vscode.TextEditor) => {
        if (editor) {
          updates.push(editor);
        }
      },
      dispose: () => {}
    };

    const provider = createLineCommentProvider({
      showCommentInput: async () => ({
        text: 'needs check',
        timestamp: new Date(0)
      }),
      copyToClipboard: async (text: string) => {
        copiedText = text;
        return true;
      },
      store,
      decorationManager
    });

    const document = await vscode.workspace.openTextDocument({
      content: 'first line\nsecond line'
    });
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    );

    await provider.addComment();

    const comments = store.list();
    assert.strictEqual(comments.length, 1);
    assert.strictEqual(comments[0].text, 'needs check');
    assert.strictEqual(comments[0].lineNumber, 1);
    assert.strictEqual(comments[0].fileName, editor.document.fileName);
    const expectedCopy = store.formatAll();

    await provider.submitComments();

    assert.strictEqual(copiedText, expectedCopy);
    assert.strictEqual(store.hasAny(), false);
    assert.strictEqual(updates.length, 2);
  });
});
