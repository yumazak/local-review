import * as assert from "assert";
import { createCommentStore } from "../store";

suite("CommentStore", () => {
  test("formatAll joins comments by newline", () => {
    const store = createCommentStore();
    store.add({ fileName: "src/a.ts", lineNumber: 1, text: "first" });
    store.add({ fileName: "src/b.ts", lineNumber: 2, text: "second" });

    assert.strictEqual(store.formatAll(), "src/a.ts:1 first\nsrc/b.ts:2 second");
  });
});
