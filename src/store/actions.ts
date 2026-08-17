import type {
  AnswerInput,
  Comment,
  FavoriteItem,
  FavoriteType,
  Notification,
  Post,
  PostInput,
  Question,
  QuestionInput,
  User,
} from '@/types';
import { genId } from '@/lib/id';
import { makeComment, makePost, makeQuestion } from '@/mock/data';

/**
 * store 逻辑切片：纯函数 reducers（工程 E2）。
 * 无副作用、不 import store；由 useAppStore 的 action 调用，保证行为与 V4 完全一致。
 */

/** 点赞：仅替换目标帖子引用，其余保持同引用（配合 React.memo(PostCard)） */
export function toggleLikeReducer(posts: Post[], postId: string): Post[] {
  return posts.map((p) =>
    p.id === postId
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p,
  );
}

/** 关注/取关：不可变更新 followingIds */
export function toggleFollowReducer(user: User, userId: string): User {
  const ids = user.followingIds ?? [];
  const followingIds = ids.includes(userId)
    ? ids.filter((id) => id !== userId)
    : [...ids, userId];
  return { ...user, followingIds };
}

/** 收藏：存在则移除、不存在则前插（幂等） */
export function toggleFavoriteReducer(
  favorites: FavoriteItem[],
  type: FavoriteType,
  id: string,
): FavoriteItem[] {
  const exists = favorites.some((f) => f.type === type && f.id === id);
  return exists
    ? favorites.filter((f) => !(f.type === type && f.id === id))
    : [{ type, id, savedAt: new Date().toISOString() }, ...favorites];
}

/** 发帖：新帖置顶 */
export function addPostReducer(posts: Post[], input: PostInput): Post[] {
  return [makePost(input), ...posts];
}

/** 提问：新提问置顶 */
export function addQuestionReducer(questions: Question[], input: QuestionInput): Question[] {
  return [makeQuestion(input), ...questions];
}

/** 回答：追加到对应问答的 answers 末尾 */
export function addAnswerReducer(
  questions: Question[],
  qid: string,
  input: AnswerInput,
  authorId: string,
): Question[] {
  return questions.map((q) =>
    q.id === qid
      ? {
          ...q,
          answers: [
            ...q.answers,
            {
              id: genId(),
              questionId: qid,
              authorId,
              isVet: input.isVet ?? false,
              content: input.content,
              likes: 0,
              isBest: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      : q,
  );
}

/** 评论/回复：评论前插 + 目标帖子 comments +1 */
export function addCommentReducer(
  state: { posts: Post[]; comments: Comment[] },
  postId: string,
  content: string,
  authorId: string,
  parentId?: string,
): { posts: Post[]; comments: Comment[] } {
  return {
    comments: [makeComment(postId, content, authorId, parentId), ...state.comments],
    posts: state.posts.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
  };
}

/** 分享成功：目标帖子 shares +1 */
export function incrementShareReducer(posts: Post[], postId: string): Post[] {
  return posts.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p));
}

/** 全部通知标记已读 */
export function markAllReadReducer(notifications: Notification[]): Notification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}

/** 标记最佳答案：问题置 resolved，目标回答 isBest=true，其余 false */
export function markBestAnswerReducer(questions: Question[], qid: string, aid: string): Question[] {
  return questions.map((q) =>
    q.id === qid
      ? {
          ...q,
          status: 'resolved',
          answers: q.answers.map((a) => ({ ...a, isBest: a.id === aid })),
        }
      : q,
  );
}
