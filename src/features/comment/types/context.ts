import type { CommentStore } from "../utils/store";
import type { CommentDecorationManager } from "../utils/decoration";

export interface CommentContext {
  store: CommentStore;
  decorationManager: CommentDecorationManager;
  showCommentInput: () => Promise<string | undefined>;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export type CommentAction = (ctx: CommentContext) => Promise<void>;
