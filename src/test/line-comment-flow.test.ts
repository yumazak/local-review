import * as assert from 'assert';
import * as vscode from 'vscode';
import { createLineCommentProvider } from '../features/line-comment/utils/line-comment-provider';
import { createCommentStore } from '../features/comment-store/utils/comment-store';
import { CommentDecorationManager } from '../features/comment-decoration/utils/comment-decoration-manager';
import { formatStandardComment } from '../utils/comment-format';

suite('Line Comment Flow', () => {
  test('add comment then submit copies and clears', async () => {
    const store = createCommentStore();
    const updates: vscode.TextEditor[] = [];
    const copiedTexts: string[] = [];

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
        copiedTexts.push(text);
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
    assert.strictEqual(copiedTexts.length, 1);
    assert.strictEqual(copiedTexts[0], formatStandardComment(comments[0]));
    const expectedCopy = store.formatAll();

    await provider.submitComments();

    assert.strictEqual(copiedTexts.length, 2);
    assert.strictEqual(copiedTexts[1], expectedCopy);
    assert.strictEqual(store.hasAny(), false);
    assert.strictEqual(updates.length, 2);
  });
});
