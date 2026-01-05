import { Comment, CommentFormatter } from '../models/comment';

export class CommentStore {
  private comments: Comment[] = [];

  add(comment: Comment): void {
    this.comments.push(comment);
  }

  list(): Comment[] {
    return [...this.comments];
  }

  listForFile(fileName: string): Comment[] {
    return this.comments.filter((comment) => comment.fileName === fileName);
  }

  formatAll(): string {
    return this.comments.map((comment) => CommentFormatter.formatStandard(comment)).join('\n');
  }

  clear(): void {
    this.comments = [];
  }

  hasAny(): boolean {
    return this.comments.length > 0;
  }
}
