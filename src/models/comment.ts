export interface Comment {
  fileName: string;
  lineNumber: number;
  text: string;
  timestamp: Date;
}

export class CommentFormatter {
  static formatStandard(comment: Comment): string {
    return `${comment.fileName}:${comment.lineNumber} ${comment.text}`;
  }
}
