import { Comment } from "../../../types/comment";
import { formatStandardComment } from "../../../utils/comment-format";

export interface CommentStore {
  add: (comment: Comment) => void;
  list: () => Comment[];
  listForFile: (fileName: string) => Comment[];
  formatAll: () => string;
  clear: () => void;
  hasAny: () => boolean;
}

export const createCommentStore = (): CommentStore => {
  let comments: Comment[] = [];

  const add = (comment: Comment): void => {
    comments.push(comment);
  };

  const list = (): Comment[] => {
    return [...comments];
  };

  const listForFile = (fileName: string): Comment[] => {
    return comments.filter((comment) => comment.fileName === fileName);
  };

  const formatAll = (): string => {
    return comments.map((comment) => formatStandardComment(comment)).join("\n");
  };

  const clear = (): void => {
    comments = [];
  };

  const hasAny = (): boolean => {
    return comments.length > 0;
  };

  return {
    add,
    list,
    listForFile,
    formatAll,
    clear,
    hasAny,
  };
};
