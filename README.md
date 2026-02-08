# Local Review

A VS Code extension for quickly collecting code review comments and sharing them with AI Agents like Claude Code, GitHub Copilot, or other AI assistants.

## Why Local Review?

When reviewing code with AI Agents, you often need to:
1. Point out specific lines that need attention
2. Collect multiple comments across different files
3. Share all feedback in a structured format

Local Review streamlines this workflow by letting you add comments directly in VS Code and copy them all at once in a format AI Agents can understand.

## Features

- Add comments to any line in the editor or diff view
- Comments are displayed as VS Code discussion threads
- Copy all comments to clipboard in a structured format
- Each comment includes filename and line number for precise reference

## Usage

### Adding Comments

1. Place cursor on the line you want to comment
2. Press `Cmd+Shift+C` (macOS) or `Ctrl+Shift+C` (Windows/Linux)
3. Enter your comment and press Enter
4. The comment appears as a discussion thread on that line

### Copying All Comments

1. Press `Cmd+Shift+Enter` (macOS) or `Ctrl+Shift+Enter` (Windows/Linux)
2. All comments are copied to clipboard and cleared

### Deleting a Comment

Click the trash icon on the comment thread to delete it.

## Output Format

Comments are formatted for easy parsing by AI Agents:

```
src/extension.ts:42 check the initialization
src/utils/parser.ts:15 this logic seems duplicated
```

## Use Cases

### Code Review with Claude Code

1. Open a diff view of changes you want to review
2. Add comments to lines that need attention
3. Copy all comments with `Cmd+Shift+Enter`
4. Paste into Claude Code with your review request

### Collecting Feedback for AI Refactoring

1. Browse through code and mark areas for improvement
2. Add comments describing what should be changed
3. Share the collected comments with your AI assistant

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Local Review: Add Comment to Current Line | `Cmd+Shift+C` | Add a comment to the current line |
| Local Review: Copy All Comments | `Cmd+Shift+Enter` | Copy all comments and clear |

## Requirements

- Visual Studio Code 1.108.0 or higher

## Development

```bash
pnpm install
pnpm run compile
pnpm test
```
