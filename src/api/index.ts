import { mockApi } from './mock';
import { fetchApi } from './fetch';
import type { FeedApi } from './types';
import {
  insertPostSync,
  insertQuestionSync,
  insertAnswerSync,
  insertCommentSync,
} from './local';

/** env 切换：VITE_API_MODE === 'fetch' 时走真实后端占位实现，默认 mock */
const isFetchMode = import.meta.env.VITE_API_MODE === 'fetch';

/** 数据访问单例（store / FeedList 显式依赖，P0-7） */
export const api: FeedApi = isFetchMode ? fetchApi : mockApi;

/** mock 同步桥导出（store action 专用，保 UI 同步） */
export { insertPostSync, insertQuestionSync, insertAnswerSync, insertCommentSync };
