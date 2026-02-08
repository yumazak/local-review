import * as assert from "assert";
import * as vscode from "vscode";
import { getEditorFileName } from "../features/editor/utils/detector";

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

suite("getEditorFileName", () => {
  teardown(async () => {
    const config = vscode.workspace.getConfiguration("localReview");
    await config.update("useAbsolutePath", undefined, vscode.ConfigurationTarget.Global);
  });

  test("returns relative path when useAbsolutePath is false (default)", async () => {
    const config = vscode.workspace.getConfiguration("localReview");
    await config.update("useAbsolutePath", false, vscode.ConfigurationTarget.Global);

    const files = await vscode.workspace.findFiles("package.json", null, 1);
    assert.ok(files.length > 0, "Workspace must contain package.json for this test");

    const document = await vscode.workspace.openTextDocument(files[0]);
    const editor = await vscode.window.showTextDocument(document);

    const fileName = getEditorFileName(editor);

    assert.ok(fileName);
    assert.strictEqual(fileName, "package.json");
  });

  test("returns absolute path when useAbsolutePath is true", async () => {
    const config = vscode.workspace.getConfiguration("localReview");
    await config.update("useAbsolutePath", true, vscode.ConfigurationTarget.Global);

    const files = await vscode.workspace.findFiles("package.json", null, 1);
    assert.ok(files.length > 0, "Workspace must contain package.json for this test");

    const document = await vscode.workspace.openTextDocument(files[0]);
    const editor = await vscode.window.showTextDocument(document);

    const fileName = getEditorFileName(editor);

    assert.ok(fileName);
    const isAbsolutePath = fileName.startsWith("/") || /^[A-Z]:\\/.test(fileName);
    assert.ok(isAbsolutePath, `Expected absolute path but got: ${fileName}`);
    assert.ok(
      fileName.endsWith("package.json"),
      `Expected path to end with package.json but got: ${fileName}`,
    );
  });
});
