import { describe, it, expect, vi, afterEach } from 'vitest';
import { createDebouncedStorage } from '@/lib/debouncedStorage';

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe('persist 防抖 debouncedStorage（E7）', () => {
  it('首写同步：setItem 立即写入 localStorage', () => {
    const storage = createDebouncedStorage(400);
    storage.setItem('k1', { state: { a: 1 }, version: 1 });
    const raw = localStorage.getItem('k1');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.a).toBe(1);
  });

  it('尾写合并：窗口内多次写只落最后一次', () => {
    vi.useFakeTimers();
    const storage = createDebouncedStorage(400);
    storage.setItem('k2', { state: { n: 1 }, version: 1 });
    // 首写已同步 n=1
    expect(JSON.parse(localStorage.getItem('k2')!).state.n).toBe(1);

    storage.setItem('k2', { state: { n: 2 }, version: 1 });
    storage.setItem('k2', { state: { n: 3 }, version: 1 });
    // 尾写未触发前仍为 n=1
    expect(JSON.parse(localStorage.getItem('k2')!).state.n).toBe(1);

    vi.advanceTimersByTime(400);
    expect(JSON.parse(localStorage.getItem('k2')!).state.n).toBe(3);
  });

  it('getItem 解析 JSON；脏数据返回 null', () => {
    const storage = createDebouncedStorage(400);
    localStorage.setItem('bad', 'not-json');
    expect(storage.getItem('bad')).toBeNull();
  });

  it('removeItem 立即删除', () => {
    const storage = createDebouncedStorage(400);
    storage.setItem('k4', { state: { x: 1 }, version: 1 });
    storage.removeItem('k4');
    expect(localStorage.getItem('k4')).toBeNull();
  });
});
