import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Contribution", () => {
  test("registers the add comment command", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("local-review.addComment"));
  });

  test("registers the submit comments command", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("local-review.submitComments"));
  });
});
