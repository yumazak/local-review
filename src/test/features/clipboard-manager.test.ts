import * as assert from 'assert';
import { ClipboardManager } from '../../features/clipboard-manager';

suite('ClipboardManager', () => {
  test('copyToClipboard writes text that can be read back', async () => {
    const clipboard = new ClipboardManager();
    const value = `diff-comment-${Date.now()}`;

    const copied = await clipboard.copyToClipboard(value);
    const read = await clipboard.readFromClipboard();

    assert.strictEqual(copied, true);
    assert.strictEqual(read, value);
  });
});
