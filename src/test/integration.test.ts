import * as assert from "assert";
import { createCommentStore } from "../features/comment/utils/store";
import type { CommentProvider } from "../features/comment/utils/provider";
import type { CommentContext } from "../features/comment/types/context";
import { submitComments } from "../features/comment/utils/actions";

suite("Integration Tests", () => {
  const createMockCommentProvider = (): CommentProvider & { clearedAll: boolean } => ({
    startCommentAtLine: async () => {},
    refreshForEditor: () => {},
    clearAllThreads: function () {
      this.clearedAll = true;
    },
    dispose: () => {},
    clearedAll: false,
  });

  test("submitComments copies all comments and clears store", async () => {
    const store = createCommentStore();
    const copiedTexts: string[] = [];
    const mockProvider = createMockCommentProvider();

    const ctx: CommentContext = {
      showCommentInput: async () => ({ text: "test" }),
      copyToClipboard: async (text: string) => {
        copiedTexts.push(text);
        return true;
      },
      store,
      commentProvider: mockProvider,
    };

    store.add({ fileName: "test.ts", lineNumber: 0, text: "first comment" });
    store.add({ fileName: "test.ts", lineNumber: 5, text: "second comment" });

    await submitComments(ctx);

    assert.strictEqual(copiedTexts.length, 1);
    assert.ok(copiedTexts[0].includes("first comment"));
    assert.ok(copiedTexts[0].includes("second comment"));
    assert.strictEqual(store.hasAny(), false);
    assert.strictEqual(mockProvider.clearedAll, true);
  });

  test("submitComments does nothing when store is empty", async () => {
    const store = createCommentStore();
    const copiedTexts: string[] = [];
    const mockProvider = createMockCommentProvider();

    const ctx: CommentContext = {
      showCommentInput: async () => ({ text: "test" }),
      copyToClipboard: async (text: string) => {
        copiedTexts.push(text);
        return true;
      },
      store,
      commentProvider: mockProvider,
    };

    await submitComments(ctx);

    assert.strictEqual(copiedTexts.length, 0);
    assert.strictEqual(mockProvider.clearedAll, false);
  });

  test("submitComments keeps comments when copyToClipboard fails", async () => {
    const store = createCommentStore();
    const mockProvider = createMockCommentProvider();

    const ctx: CommentContext = {
      showCommentInput: async () => ({ text: "test" }),
      copyToClipboard: async () => false,
      store,
      commentProvider: mockProvider,
    };

    store.add({ fileName: "test.ts", lineNumber: 0, text: "comment" });

    await submitComments(ctx);

    assert.strictEqual(store.hasAny(), true);
    assert.strictEqual(mockProvider.clearedAll, false);
  });
});
