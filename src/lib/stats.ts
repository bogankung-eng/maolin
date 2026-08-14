import type { Post, Question, User } from '@/types';

/** 派生后的用户统计（动态 / 回答 / 关注 / 粉丝） */
export interface DerivedStats {
  posts: number;
  answers: number;
  following: number;
  fans: number;
}

/**
 * 派生用户统计（F5 统计真实化）：
 * - 动态 = posts 中 authorId === user.id 的数量
 * - 回答 = questions 中 authorId === user.id 的回答条数之和
 * - 关注 = user.followingIds.length
 * - 粉丝 = 固定 230
 * 替代 V1/V2 硬编码的 user.stats.posts/answers/following。
 */
export function deriveUserStats(user: User, posts: Post[], questions: Question[]): DerivedStats {
  const postsCount = posts.filter((p) => p.authorId === user.id).length;
  const answersCount = questions.reduce(
    (sum, q) => sum + q.answers.filter((a) => a.authorId === user.id).length,
    0,
  );
  return {
    posts: postsCount,
    answers: answersCount,
    following: (user.followingIds ?? []).length,
    fans: 230,
  };
}
