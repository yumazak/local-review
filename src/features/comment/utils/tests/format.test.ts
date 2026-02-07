import * as assert from "assert";
import { formatStandardComment } from "../format";

suite("CommentFormatter", () => {
  test("formatStandard formats file, line, and text", () => {
    const formatted = formatStandardComment({
      fileName: "src/example-file.ts",
      lineNumber: 11,
      text: "check this",
    });

    assert.strictEqual(formatted, "src/example-file.ts:12 check this");
  });
});
