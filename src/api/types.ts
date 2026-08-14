import type { Post, Question, Answer, Comment, PostInput, QuestionInput, AnswerInput } from '@/types';

/**
 * 数据访问契约：mock 与 fetch 共用同一接口（未来接后端只换实现 + .env）。
 * 组件/页面禁止直接 import '@/lib/mockApi' 做数据操作，一律走本契约。
 *
 * REST 约定（工程 E9）：每个方法对应后端端点，统一响应 `{ code, data, message }`，详见 src/api/README.md。
 */
export interface FeedApi {
  /** GET /posts?page=&size= → 分页获取 Feed 帖子；sourceList 为 mock 专用已过滤列表注入（fetch 模式忽略，由后端过滤） */
  getFeedPage(page?: number, size?: number, sourceList?: Post[]): Promise<Post[]>;
  /** POST /posts → 插入帖子（入参 PostInput，出参 Post） */
  insertPost(input: PostInput): Promise<Post>;
  /** POST /questions → 插入问答（入参 QuestionInput，出参 Question） */
  insertQuestion(input: QuestionInput): Promise<Question>;
  /** POST /questions/:id/answers → 插入回答（入参 questionId + AnswerInput，出参 Answer） */
  insertAnswer(questionId: string, input: AnswerInput): Promise<Answer>;
  /** POST /posts/:id/comments → 插入评论/一级回复（入参 postId + content + parentId?，出参 Comment） */
  insertComment(postId: string, content: string, parentId?: string): Promise<Comment>;
}
