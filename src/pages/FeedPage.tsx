import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TopBar } from '@/components/layout/TopBar';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { FeedList } from '@/components/feed/FeedList';
import { HealthBanner } from '@/components/health/HealthBanner';
import { LocalView } from '@/components/local/LocalView';
import type { Post } from '@/types';

/**
 * 首页 Feed：顶栏 Tab + 健康横幅 + 分类 + 卡片流。
 * - recommend/following 保留 HealthBanner + CategoryFilter + FeedList
 * - local Tab 由 LocalView 接管（城市选择器 + 4 分区，不再渲染帖子流）
 */
export function FeedPage() {
  const posts = useAppStore((s) => s.posts);
  const activeTab = useAppStore((s) => s.activeTab);
  const activeCategory = useAppStore((s) => s.activeCategory);
  const followingIds = useAppStore((s) => s.currentUser.followingIds);

  const filtered = useMemo(() => {
    let list: Post[];
    if (activeTab === 'following') {
      list = posts.filter((p) => followingIds.includes(p.authorId)); // 关注表驱动
    } else if (activeTab === 'local') {
      list = posts.filter((p) => p.source === 'local');
    } else {
      list = posts.filter((p) => p.source === 'recommend');
    }
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    return list;
  }, [posts, activeTab, activeCategory, followingIds]);

  // 关注流空态：提示条 + 推荐流兜底（不白屏）
  const isFollowingEmpty = activeTab === 'following' && filtered.length === 0;
  const fallbackPosts = useMemo(() => posts.filter((p) => p.source === 'recommend'), [posts]);

  if (activeTab === 'local') {
    return (
      <div>
        <TopBar />
        <div key="local" className="animate-fade">
          <LocalView />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar />
      <div key={activeTab} className="animate-fade">
        <HealthBanner />
        <CategoryFilter />
        {isFollowingEmpty ? (
          <>
            <div className="bg-bg px-4 pb-2">
              <div className="rounded-pill bg-warning-bg px-3 py-2 text-center text-xs text-warning">
                关注感兴趣的主人来这里看 TA 的动态
              </div>
            </div>
            <FeedList posts={fallbackPosts} variant="compact" />
          </>
        ) : (
          <FeedList
            posts={filtered}
            variant={activeTab === 'following' ? 'compact' : 'full'}
          />
        )}
      </div>
    </div>
  );
}
