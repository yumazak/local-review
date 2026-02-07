import { describe, it, expect } from 'vitest';
import { formatStandardComment } from '../comment-format';

describe('CommentFormatter', () => {
  it('formatStandard formats file, line, and text', () => {
    const formatted = formatStandardComment({
      fileName: 'src/example-file.ts',
      lineNumber: 12,
      text: 'check this',
      timestamp: new Date()
    });

    expect(formatted).toBe('src/example-file.ts:12 check this');
  });
});
