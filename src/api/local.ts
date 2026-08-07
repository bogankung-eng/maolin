import { makePost, makeQuestion, makeComment } from '@/mock/data';
import type { Post, Question, Answer, Comment, PostInput, QuestionInput, AnswerInput } from '@/types';

const genId = (): string => 'id_' + Math.random().toString(36).slice(2, 10);

/**
 * mock 同步桥（store 专用）：在 mock 模式下同步构造实体，保证 UI 即时同步、
 * 存量测试不改。内部复用与 mockApi.insert* 完全同源的工厂（makePost/makeQuestion/Answer/Comment），
 * 保证 mock 双轨数据一致。
 */

/** 同步插入帖子 */
export function insertPostSync(input: PostInput): Post {
  return makePost(input);
}

/** 同步插入问答 */
export function insertQuestionSync(input: QuestionInput): Question {
  return makeQuestion(input);
}

/** 同步插入回答（authorId 由调用方传入，通常为当前用户） */
export function insertAnswerSync(questionId: string, input: AnswerInput, authorId: string): Answer {
  return {
    id: genId(),
    questionId,
    authorId,
    isVet: input.isVet ?? false,
    content: input.content,
    likes: 0,
    isBest: false,
    createdAt: new Date().toISOString(),
  };
}

/** 同步插入评论 / 一级回复 */
export function insertCommentSync(
  postId: string,
  content: string,
  authorId: string,
  parentId?: string,
): Comment {
  return makeComment(postId, content, authorId, parentId);
}
