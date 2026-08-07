import type { FeedApi } from './types';
import type { Post, Question, Answer, Comment, PostInput, QuestionInput, AnswerInput } from '@/types';

/**
 * fetch 占位实现：与 mock 同接口（FeedApi 契约）。
 * 接入真实后端时在此实现各方法，并把 .env 的 VITE_API_MODE 改为 fetch。
 * 参数用 _ 前缀规避 noUnusedParameters。
 */
export const fetchApi: FeedApi = {
  async getFeedPage(_page?: number, _size?: number, _sourceList?: Post[]): Promise<Post[]> {
    throw new Error('真实后端尚未接入，请在 fetch.ts 实现');
  },
  async insertPost(_input: PostInput): Promise<Post> {
    throw new Error('真实后端尚未接入，请在 fetch.ts 实现');
  },
  async insertQuestion(_input: QuestionInput): Promise<Question> {
    throw new Error('真实后端尚未接入，请在 fetch.ts 实现');
  },
  async insertAnswer(_questionId: string, _input: AnswerInput): Promise<Answer> {
    throw new Error('真实后端尚未接入，请在 fetch.ts 实现');
  },
  async insertComment(
    _postId: string,
    _content: string,
    _parentId?: string,
  ): Promise<Comment> {
    throw new Error('真实后端尚未接入，请在 fetch.ts 实现');
  },
};
