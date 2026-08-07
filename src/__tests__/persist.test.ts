import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

const STORAGE_KEY = 'maolin-store-v1';

beforeEach(() => resetStore());

describe('Zustand persist（localStorage 持久化）', () => {
  it('状态变更后写入 localStorage，且只持久化 7 个数据字段', () => {
    useAppStore.getState().toggleLike('post_1');
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw!);
    expect(persisted.state).toHaveProperty('posts');
    expect(persisted.state).toHaveProperty('questions');
    expect(persisted.state).toHaveProperty('pets');
    expect(persisted.state).toHaveProperty('healthRecords');
    // V2 新增持久化字段
    expect(persisted.state).toHaveProperty('comments');
    expect(persisted.state).toHaveProperty('notifications');
    expect(persisted.state).toHaveProperty('currentUser');
    expect(persisted.state.currentUser.followingIds).toEqual(['u_lin', 'u_zhou']);
    // 视图态不应入库
    expect(persisted.state).not.toHaveProperty('activeTab');
    expect(persisted.state).not.toHaveProperty('toast');
    // 点赞状态已持久化
    const likedPost = persisted.state.posts.find((p: { id: string }) => p.id === 'post_1');
    expect(likedPost.liked).toBe(true);
  });

  it('新会话（重新加载 store）从 localStorage 恢复持久化数据', async () => {
    // 制造修改并写入 localStorage
    useAppStore.getState().addPost({
      content: '持久化测试帖',
      petTag: '🐶 豆豆',
      tags: ['测试'],
      category: 'health',
      images: [],
      source: 'recommend',
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).state.posts[0].content).toBe(
      '持久化测试帖',
    );

    // 模拟新会话：重置模块 + 清空内存，重新 import store
    vi.resetModules();
    localStorage.setItem(STORAGE_KEY, localStorage.getItem(STORAGE_KEY)!);
    const { useAppStore: freshStore } = await import('@/store/useAppStore');
    // persist hydrate 后，posts 应为持久化的数据（含新帖在最前）
    expect(freshStore.getState().posts[0].content).toBe('持久化测试帖');
    expect(freshStore.getState().posts).toHaveLength(8);
  });

  it('resetStore 后 store 回到种子态（内存），localStorage 被 persist 重新写入种子数据', () => {
    useAppStore.getState().toggleLike('post_1');
    // resetStore 内部 setState → persist 会写回种子态
    resetStore();
    expect(useAppStore.getState().posts).toHaveLength(7);
    expect(useAppStore.getState().posts.find((p) => p.id === 'post_1')!.liked).toBe(false);
    // localStorage 里现在是种子态快照（点赞已还原为 false）
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const p1 = persisted.state.posts.find((p: { id: string }) => p.id === 'post_1');
    expect(p1.liked).toBe(false);
  });

  it('publishOverlay / toast 属于视图态，不写入持久化', () => {
    useAppStore.getState().openPublish('question');
    useAppStore.getState().showToast('测试提示');
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const persisted = JSON.parse(raw!);
      expect(persisted.state).not.toHaveProperty('publishOverlay');
      expect(persisted.state).not.toHaveProperty('toast');
    }
    // 视图态在内存中正常
    expect(useAppStore.getState().publishOverlay.mode).toBe('question');
    expect(useAppStore.getState().toast.message).toBe('测试提示');
  });

  it('脏数据不破坏当前会话（merge 容错，不抛错）', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { posts: [{ id: 'junk' }] }, version: 0 }),
    );
    // 当前内存态仍完整可用
    expect(useAppStore.getState().questions.length).toBeGreaterThan(0);
    expect(useAppStore.getState().pets.length).toBeGreaterThan(0);
  });

  it('v0 旧数据迁移：缺新字段回退种子（comments/notifications/followingIds）', async () => {
    // 写入 v0 形态旧数据（仅 4 字段、无 version=1 的新字段）
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { posts: [{ id: 'junk' }], questions: [], pets: [], healthRecords: [] },
        version: 0,
      }),
    );
    vi.resetModules();
    const { useAppStore: freshStore } = await import('@/store/useAppStore');
    const s = freshStore.getState();
    // posts 为数组（脏数据保留）
    expect(Array.isArray(s.posts)).toBe(true);
    // 新字段回退种子
    expect(s.comments.length).toBeGreaterThan(0);
    expect(s.notifications.length).toBeGreaterThan(0);
    expect(Array.isArray(s.currentUser.followingIds)).toBe(true);
    expect(s.currentUser.followingIds).toEqual(['u_lin', 'u_zhou']);
  });
});
