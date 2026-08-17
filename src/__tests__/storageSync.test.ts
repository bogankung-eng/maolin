import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initStorageSync } from '@/lib/storageSync';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => {
  resetStore();
  vi.restoreAllMocks();
});

/** 派发一个 storage 事件（jsdom 可能无 StorageEvent 构造，手动挂 key/newValue） */
function fireStorage(key: string, newValue: string | null): void {
  const event = new Event('storage') as StorageEvent;
  Object.defineProperty(event, 'key', { value: key });
  Object.defineProperty(event, 'newValue', { value: newValue });
  window.dispatchEvent(event);
}

describe('多标签同步 storageSync（E8）', () => {
  it('同步 8 个持久化字段，且不覆盖视图态', () => {
    initStorageSync();
    useAppStore.setState({ activeTab: 'following', publishGuide: { open: true } });

    const base = useAppStore.getState();
    const payload = JSON.stringify({
      state: {
        posts: base.posts,
        questions: base.questions,
        pets: base.pets,
        healthRecords: base.healthRecords,
        comments: base.comments,
        notifications: base.notifications,
        currentUser: { ...base.currentUser, name: '跨标签同步' },
        favorites: [{ type: 'post' as const, id: 'post_1', savedAt: new Date().toISOString() }],
      },
      version: 1,
    });

    fireStorage('maolin-store-v1', payload);

    expect(useAppStore.getState().currentUser.name).toBe('跨标签同步');
    expect(useAppStore.getState().favorites).toHaveLength(1);
    // 视图态不被覆盖
    expect(useAppStore.getState().activeTab).toBe('following');
    expect(useAppStore.getState().publishGuide.open).toBe(true);
  });

  it('key 不匹配 / newValue 为 null 时忽略', () => {
    initStorageSync();
    const beforeName = useAppStore.getState().currentUser.name;
    fireStorage('other-key', '{}');
    fireStorage('maolin-store-v1', null);
    expect(useAppStore.getState().currentUser.name).toBe(beforeName);
  });

  it('同值守卫 lastApplied：连续同值只应用一次（防回写死循环）', () => {
    initStorageSync();
    const spy = vi.spyOn(useAppStore, 'setState');
    const payload = JSON.stringify({
      state: { favorites: [{ type: 'post', id: 'p9', savedAt: new Date().toISOString() }] },
      version: 1,
    });

    fireStorage('maolin-store-v1', payload);
    const callsAfterFirst = spy.mock.calls.length;
    fireStorage('maolin-store-v1', payload);
    expect(spy.mock.calls.length).toBe(callsAfterFirst);
  });
});
