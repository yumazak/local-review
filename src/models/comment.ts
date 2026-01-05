export interface Comment {
  fileName: string;
  lineNumber: number;
  text: string;
  timestamp: Date;
}

export const formatStandardComment = (comment: Comment): string => {
  return `${comment.fileName}:${comment.lineNumber} ${comment.text}`;
};
