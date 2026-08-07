import { getFeedPage, insertPost, insertQuestion, insertAnswer, delay } from '@/lib/mockApi';
import { makeComment } from '@/mock/data';
import type { FeedApi } from './types';

/**
 * mock 实现：包一层 lib/mockApi（保持 async 契约）。
 * insertComment 在 mockApi 中无对应实现，直接复用 makeComment 工厂（与 local 桥同源）。
 */
export const mockApi: FeedApi = {
  getFeedPage,
  insertPost,
  insertQuestion,
  insertAnswer,
  insertComment: async (postId, content, parentId) => {
    await delay(300);
    return makeComment(postId, content, 'u_me', parentId);
  },
};
