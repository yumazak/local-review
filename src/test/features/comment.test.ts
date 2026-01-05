import * as assert from 'assert';
import { CommentFormatter } from '../../models/comment';

suite('CommentFormatter', () => {
  test('formatStandard formats file, line, and text', () => {
    const formatted = CommentFormatter.formatStandard({
      fileName: 'src/example-file.ts',
      lineNumber: 12,
      text: 'check this',
      timestamp: new Date()
    });

    assert.strictEqual(formatted, 'src/example-file.ts:12 check this');
  });
});
