import type { Post, Question, Answer, Comment, PostInput, QuestionInput, AnswerInput } from '@/types';

/**
 * 数据访问契约：mock 与 fetch 共用同一接口（未来接后端只换实现 + .env）。
 * 组件/页面禁止直接 import '@/lib/mockApi' 做数据操作，一律走本契约。
 */
export interface FeedApi {
  /** 分页获取 Feed 帖子；sourceList 为 mock 专用已过滤列表注入（fetch 模式忽略，由后端过滤） */
  getFeedPage(page?: number, size?: number, sourceList?: Post[]): Promise<Post[]>;
  insertPost(input: PostInput): Promise<Post>;
  insertQuestion(input: QuestionInput): Promise<Question>;
  insertAnswer(questionId: string, input: AnswerInput): Promise<Answer>;
  insertComment(postId: string, content: string, parentId?: string): Promise<Comment>;
}
