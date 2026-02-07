import { showCommentInput as showQuickInput } from "../../../ui/quick-input-builder";

export interface CommentInput {
  text: string;
  timestamp: Date;
}

export const showCommentInput = async (): Promise<CommentInput | undefined> => {
  const text = await showQuickInput();

  if (!text) {
    return undefined;
  }

  return {
    text: text.trim(),
    timestamp: new Date(),
  };
};
