# Diff Comment

Add comments for lines in a VS Code diff editor, show them inline, and copy them all at once.

## Features

- Captures file name and 1-based line number from the active editor
- Prompts for a comment using the native input box
- Shows a faint inline note in the diff editor
- Copies all stored comments to the clipboard in one batch

## Usage

1. Open a diff view and place the cursor on the line you want to comment on.
2. Run the command:
   - Command Palette: `Diff Comment: Add Comment to Current Line`
   - Shortcut: `Ctrl+Shift+C` (macOS: `Cmd+Shift+C`)
3. Enter your comment and press Enter.
4. The comment appears faintly at the end of the line.
5. When you are ready to copy all comments, run:
   - Command Palette: `Diff Comment: Copy All Comments`
   - Editor context menu: `Copy All Comments`
6. After copying, the stored comments are cleared.

## Output Format

```
src/extension.ts:42 check the initialization
```

## Requirements

- Visual Studio Code 1.107.0 or later

## Development

```bash
npm run compile
npm test
```
