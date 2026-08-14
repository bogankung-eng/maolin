import { useCallback, useEffect, useRef, useState } from 'react';
import { PostCard } from './PostCard';
import { api } from '@/api';
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

/**
 * 卡片流：上滑加载更多 + 下拉刷新（P0-7/8）。
 * 竞态防护：
 * - loadingRef/refreshingRef 同步防抖（连续 IO 触发只 loadMore 1 次）
 * - mountedRef 卸载取消（pending 回调不再 setState）
 * - listRef 列表变更丢弃过期响应
 * - IO 只依赖 [posts] 重建
 */
export function FeedList({ posts }: { posts: Post[] }) {
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const refreshingRef = useRef(false);
  const mountedRef = useRef(true);
  const listRef = useRef(posts);
  const visibleRef = useRef(PAGE);

  // 卸载取消：延迟回调不再 setState、不报错
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 数据变化重置分页
  useEffect(() => {
    listRef.current = posts;
    visibleRef.current = PAGE;
    loadingRef.current = false;
    setLoading(false);
    setVisible(PAGE);
  }, [posts]);

  // 同步 visible 镜像（供 loadMore 计算页码）
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // loadMore 只依赖 refs / setter / 模块常量（均稳定），useCallback 保持引用稳定，
  // 使 IO 回调无需用 ref 缓存最新函数（规避 react-hooks/refs 的 ref-in-render 问题）。
  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    const list = listRef.current;
    if (visibleRef.current >= list.length) return;
    loadingRef.current = true;
    setLoading(true);
    const page = Math.floor(visibleRef.current / PAGE) + 1;
    // P0-7：显式走 api 层（mock 模式下 sourceList 注入已过滤列表）
    api.getFeedPage(page, PAGE, list).then((result) => {
      // 已卸载或列表已变更 → 丢弃过期响应
      if (!mountedRef.current || listRef.current !== list) {
        loadingRef.current = false;
        return;
      }
      loadingRef.current = false;
      setLoading(false);
      setVisible((v) => Math.min(v + result.length, list.length));
    });
  }, []);

  // 触底加载更多（IntersectionObserver，仅依赖 [posts] 重建；loadMore 引用稳定不触发重建）
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [posts, loadMore]);

  const doRefresh = () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    api.getFeedPage(1, PAGE, listRef.current).then(() => {
      if (!mountedRef.current) return;
      refreshingRef.current = false;
      setRefreshing(false);
      setVisible(PAGE);
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
      {refreshing && <div className="py-2 text-center text-xs text-text-tertiary">刷新中…</div>}
      {shown.map((p, i) => (
        <div
          key={p.id}
          className="animate-fade-up"
          style={{ animationDelay: `${(i % PAGE) * 60}ms` }}
        >
          <PostCard post={p} />
        </div>
      ))}
      {loading && <div className="py-3 text-center text-xs text-text-tertiary">加载中…</div>}
      {visible >= posts.length && posts.length > 0 && (
        <div className="py-3 text-center text-xs text-text-tertiary">没有更多了</div>
      )}
      {posts.length === 0 && (
        <div className="py-10 text-center text-sm text-text-tertiary">这里还没有内容</div>
      )}
      <div ref={sentinel} className="h-4" />
    </div>
  );
}
