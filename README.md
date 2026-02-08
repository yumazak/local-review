# Local Review

Add line comments in VS Code, display them at line endings, and copy all at once.

## Features

- Records filename and 1-based line number from active editor
- Uses standard VS Code input box for comments
- Displays comments at line endings with highlighting
- Copies all saved comments to clipboard at once

## Usage

1. Open a file or diff view and place cursor on the line you want to comment
2. Run the command:
   - Command Palette: `Local Review: Add Comment to Current Line`
   - Shortcut: `Ctrl+Shift+C` (macOS: `Cmd+Shift+C`)
3. Enter your comment and press Enter
4. The comment appears at the end of the line
5. To copy all comments:
   - Command Palette: `Local Review: Copy All Comments`
   - Editor context menu: `Copy All Comments`
   - Shortcut: `Ctrl+Shift+Enter` (macOS: `Cmd+Shift+Enter`)
6. After copying, saved comments are cleared

## Output Format

```
src/extension.ts:42 check the initialization
```

## Requirements

- Visual Studio Code 1.107.0 or higher

## Development

```bash
pnpm run compile
pnpm test
```
