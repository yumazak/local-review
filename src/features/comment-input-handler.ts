import { QuickInputBuilder } from '../ui/quick-input-builder';

export interface CommentInput {
  text: string;
  timestamp: Date;
}

export class CommentInputHandler {
  public async showCommentInput(): Promise<CommentInput | undefined> {
    const text = await QuickInputBuilder.showCommentInput();

    if (!text) {
      return undefined;
    }

    return {
      text: text.trim(),
      timestamp: new Date()
    };
  }
}
