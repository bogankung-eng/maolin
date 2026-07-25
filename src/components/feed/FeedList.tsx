import { useEffect, useRef, useState } from 'react';
import { PostCard } from './PostCard';
import { delay } from '@/lib/mockApi';
import type { Post } from '@/types';

const PAGE = 6;

/** 查找最近的滚动父元素（用于下拉刷新判断是否在顶部） */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if (oy === 'auto' || oy === 'scroll') return el;
    el = el.parentElement;
  }
  return null;
}

/** 卡片流：上滑加载更多（本地切片 + 模拟异步），支持下拉刷新 */
export function FeedList({ posts }: { posts: Post[] }) {
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // 数据变化重置分页
  useEffect(() => {
    setVisible(PAGE);
  }, [posts]);

  const loadMore = () => {
    if (loading || visible >= posts.length) return;
    setLoading(true);
    delay(400).then(() => {
      setVisible((v) => Math.min(v + PAGE, posts.length));
      setLoading(false);
    });
  };

  // 触底加载更多（IntersectionObserver）
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, visible, loading]);

  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    delay(500).then(() => {
      setVisible(PAGE);
      setRefreshing(false);
    });
  };

  const shown = posts.slice(0, visible);

  // 下拉刷新（触摸手势）
  const startY = useRef<number | null>(null);
  const pull = useRef(0);
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const parent = getScrollParent(e.currentTarget);
    if (parent && parent.scrollTop <= 0) startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startY.current == null) return;
    pull.current = e.touches[0].clientY - startY.current;
  };
  const onTouchEnd = () => {
    if (startY.current != null && pull.current > 60) doRefresh();
    startY.current = null;
    pull.current = 0;
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {refreshing && (
        <div className="text-center text-xs text-text-tertiary py-2">刷新中…</div>
      )}
      {shown.map((p, i) => (
        <div
          key={p.id}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <PostCard post={p} />
        </div>
      ))}
      {loading && <div className="text-center text-xs text-text-tertiary py-3">加载中…</div>}
      {visible >= posts.length && posts.length > 0 && (
        <div className="text-center text-xs text-text-tertiary py-3">没有更多了</div>
      )}
      {posts.length === 0 && (
        <div className="text-center text-text-tertiary py-10 text-sm">这里还没有内容</div>
      )}
      <div ref={sentinel} className="h-4" />
    </div>
  );
}
