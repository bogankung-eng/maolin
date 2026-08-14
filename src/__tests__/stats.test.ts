import { describe, it, expect } from 'vitest';
import { deriveUserStats } from '@/lib/stats';
import { isRealImage } from '@/lib/image';
import { currentUser, seedPosts, seedQuestions } from '@/mock/data';
import type { User, Post, Question } from '@/types';

describe('deriveUserStats 统计派生', () => {
  it('种子状态：动态1 / 回答0 / 关注2 / 粉丝230', () => {
    expect(deriveUserStats(currentUser, seedPosts, seedQuestions)).toEqual({
      posts: 1,
      answers: 0,
      following: 2,
      fans: 230,
    });
  });

  it('动态/回答按 authorId 派生，关注按 followingIds 长度，粉丝固定 230', () => {
    const user: User = { ...currentUser, followingIds: [] };
    const posts: Post[] = [
      { ...seedPosts[0], authorId: 'u_me' },
      { ...seedPosts[1], authorId: 'u_lin' },
    ];
    const questions: Question[] = [
      {
        ...seedQuestions[0],
        answers: [
          { ...seedQuestions[0].answers[0], authorId: 'u_me' },
          { ...seedQuestions[0].answers[0], authorId: 'u_lin', id: 'a9' },
        ],
      },
    ];

    const s = deriveUserStats(user, posts, questions);
    expect(s.posts).toBe(1);
    expect(s.answers).toBe(1);
    expect(s.following).toBe(0);
    expect(s.fans).toBe(230);
  });
});

describe('isRealImage 图片判定', () => {
  it('data:image 与 http 开头为真实图', () => {
    expect(isRealImage('data:image/png;base64,abc')).toBe(true);
    expect(isRealImage('https://x/a.png')).toBe(true);
    expect(isRealImage('http://x/a.png')).toBe(true);
  });

  it('emoji / 空值为非真实图', () => {
    expect(isRealImage('🐶')).toBe(false);
    expect(isRealImage('')).toBe(false);
    expect(isRealImage(undefined)).toBe(false);
    expect(isRealImage(null)).toBe(false);
  });
});
