import * as assert from 'assert';
import { copyToClipboard, readFromClipboard } from '../clipboard-manager';

suite('ClipboardManager', () => {
  test('copyToClipboard writes text that can be read back', async () => {
    const value = `diff-comment-${Date.now()}`;

    const copied = await copyToClipboard(value);
    const read = await readFromClipboard();

    assert.strictEqual(copied, true);
    assert.strictEqual(read, value);
  });
});
