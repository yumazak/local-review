import { describe, it, expect } from 'vitest';
import { createCommentStore } from '../comment-store';

describe('CommentStore', () => {
  it('formatAll joins comments by newline', () => {
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

    expect(store.formatAll()).toBe('src/a.ts:1 first\nsrc/b.ts:2 second');
  });
});
