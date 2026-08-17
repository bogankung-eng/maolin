import type { Post, Question, Answer, PostInput, QuestionInput, AnswerInput } from '@/types';
import { makePost, makeQuestion, seedPosts } from '@/mock/data';
import { genId } from '@/lib/id';

/** 模拟网络延时（200-400ms） */
export function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 分页获取 Feed 帖子列表。
 * 基于 seedPosts（或注入的 sourceList）做客户端切片：page 与 size 均从 1 开始计数。
 * - sourceList 为 mock 模式专用「已过滤列表注入」；fetch 模式忽略（由后端按 query 过滤）
 * - page=1, size=6 → 返回前 6 条
 * - page=2, size=6 → 返回第 7 条起剩余的条目（不足一页则取实际剩余量）
 * - 越界页返回空数组 []
 */
export async function getFeedPage(page: number = 1, size: number = 6, sourceList?: Post[]): Promise<Post[]> {
  await delay(300);
  const base = sourceList ?? seedPosts;
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(size));
  const start = (safePage - 1) * safeSize;
  return base.slice(start, start + safeSize);
}

/** 模拟插入帖子 */
export async function insertPost(input: PostInput): Promise<Post> {
  await delay(300);
  return makePost(input);
}

/** 模拟插入问答 */
export async function insertQuestion(input: QuestionInput): Promise<Question> {
  await delay(300);
  return makeQuestion(input);
}

/** 模拟插入回答 */
export async function insertAnswer(questionId: string, input: AnswerInput): Promise<Answer> {
  await delay(300);
  return {
    id: genId(),
    questionId,
    authorId: 'u_me',
    isVet: input.isVet ?? false,
    content: input.content,
    likes: 0,
    isBest: false,
    createdAt: new Date().toISOString(),
  };
}

/** 格式化 ISO 日期为 YYYY-MM-DD */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
