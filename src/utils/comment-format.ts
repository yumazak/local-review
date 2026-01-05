import { Comment } from '../types/comment';

export const formatStandardComment = (comment: Comment): string => {
  return `${comment.fileName}:${comment.lineNumber} ${comment.text}`;
};
