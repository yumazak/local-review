import * as assert from 'assert';
import { createCommentStore } from '../../features/comment-store/utils/comment-store';

suite('CommentStore', () => {
  test('formatAll joins comments by newline', () => {
    const store = createCommentStore();
    store.add({
      fileName: 'src/a.ts',
      lineNumber: 1,
      text: 'first',
      timestamp: new Date()
    });
    store.add({
      fileName: 'src/b.ts',
      lineNumber: 2,
      text: 'second',
      timestamp: new Date()
    });

    assert.strictEqual(store.formatAll(), 'src/a.ts:1 first\nsrc/b.ts:2 second');
  });
});
