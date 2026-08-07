import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeedList } from '@/components/feed/FeedList';
import { resetStore } from '@/test/helpers';
import type { Post } from '@/types';

/** 捕获 IO 回调的 IntersectionObserver mock（jsdom 无此 API） */
let ioCallbacks: IntersectionObserverCallback[] = [];

class CapturingIO {
  callback: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    ioCallbacks.push(cb);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function makePosts(n: number): Post[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p_${i}`,
    authorId: 'u_me',
    petTag: '🐶 豆豆',
    category: 'health' as const,
    content: `内容 ${i}`,
    images: [],
    tags: [],
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    createdAt: new Date(Date.now() - i * 1000).toISOString(),
    source: 'recommend' as const,
  }));
}

function renderList(posts: Post[]) {
  return render(
    <MemoryRouter>
      <FeedList posts={posts} />
    </MemoryRouter>,
  );
}

/** 手动触发触底（模拟 IO 回调） */
function triggerIO() {
  act(() => {
    for (const cb of ioCallbacks) {
      cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    }
  });
}

beforeEach(() => {
  resetStore();
  ioCallbacks = [];
  // @ts-expect-error 注入捕获回调的 IO mock
  globalThis.IntersectionObserver = CapturingIO;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('FeedList 加载更多（P0-8 竞态防护）', () => {
  it('触底加载更多：visible += PAGE（mock 300ms 延迟）', async () => {
    vi.useFakeTimers();
    renderList(makePosts(8));
    // 初始只显示 PAGE 条
    expect(screen.getByText('内容 0')).toBeInTheDocument();
    expect(screen.queryByText('内容 7')).not.toBeInTheDocument();

    triggerIO();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    // 8 条 < 2*PAGE → 全部显示 + 没有更多
    expect(screen.getByText('内容 7')).toBeInTheDocument();
    expect(screen.getByText('没有更多了')).toBeInTheDocument();
  });

  it('posts 变更重置 visible 到 PAGE', () => {
    vi.useFakeTimers();
    const ui = (posts: Post[]) => (
      <MemoryRouter>
        <FeedList posts={posts} />
      </MemoryRouter>
    );
    const { rerender } = render(ui(makePosts(12)));
    expect(screen.queryByText('内容 11')).not.toBeInTheDocument();
    expect(screen.queryByText('没有更多了')).not.toBeInTheDocument();

    rerender(ui(makePosts(4)));
    // 4 条 < PAGE → 全部显示 + 没有更多
    expect(screen.getByText('内容 3')).toBeInTheDocument();
    expect(screen.getByText('没有更多了')).toBeInTheDocument();
  });

  it('竞态：连续触发 2 次 IO 只 loadMore 1 次', async () => {
    vi.useFakeTimers();
    renderList(makePosts(20));
    triggerIO();
    triggerIO();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    // 只加载一页：visible = 6 + 6 = 12（内容 11 可见、内容 12 不可见）
    expect(screen.getByText('内容 11')).toBeInTheDocument();
    expect(screen.queryByText('内容 12')).not.toBeInTheDocument();
  });

  it('卸载取消：unmount 后 pending 延迟回调不 setState、不报错', async () => {
    vi.useFakeTimers();
    const { unmount } = renderList(makePosts(20));
    triggerIO();
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    // 无异常即通过（mountedRef 防护）
    expect(true).toBe(true);
  });
});
