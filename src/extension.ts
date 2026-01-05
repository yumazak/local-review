import * as vscode from 'vscode';
import { LineCommentProvider } from './features/line-comment-provider';
import { CommentInputHandler } from './features/comment-input-handler';
import { ClipboardManager } from './features/clipboard-manager';
import { CommentStore } from './features/comment-store';
import { CommentDecorationManager } from './features/comment-decoration-manager';

export function activate(context: vscode.ExtensionContext) {
	console.log('Diff Comment extension is now active');

	// 依存関係の構築
	const clipboardManager = new ClipboardManager();
	const inputHandler = new CommentInputHandler();
	const store = new CommentStore();
	const decorationManager = new CommentDecorationManager(store);
	const commentProvider = new LineCommentProvider(
		inputHandler,
		clipboardManager,
		store,
		decorationManager
	);

	// コマンドの登録
	const addCommentCommand = vscode.commands.registerCommand(
		'diff-comment.addComment',
		async () => {
			try {
				await commentProvider.addComment();
			} catch (error) {
				vscode.window.showErrorMessage(`コメントの追加に失敗しました: ${error}`);
			}
		}
	);

	const submitCommentsCommand = vscode.commands.registerCommand(
		'diff-comment.submitComments',
		async () => {
			try {
				await commentProvider.submitComments();
			} catch (error) {
				vscode.window.showErrorMessage(`コメントの送信に失敗しました: ${error}`);
			}
		}
	);

	const addCommentAtLineCommand = vscode.commands.registerCommand(
		'diff-comment.addCommentAtLine',
		async (lineNumber: number, fileName: string) => {
			try {
				await commentProvider.addCommentAtLine(lineNumber, fileName);
			} catch (error) {
				vscode.window.showErrorMessage(`コメントの追加に失敗しました: ${error}`);
			}
		}
	);
	const editorChangeSubscription = vscode.window.onDidChangeActiveTextEditor((editor) => {
		decorationManager.update(editor);
	});

	context.subscriptions.push(
		addCommentCommand,
		submitCommentsCommand,
		addCommentAtLineCommand,
		editorChangeSubscription,
		decorationManager
	);
}

export function deactivate() {
	// クリーンアップ処理
}
