import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TopBar } from '@/components/layout/TopBar';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { FeedList } from '@/components/feed/FeedList';
import { HealthBanner } from '@/components/health/HealthBanner';

/**
 * 首页 Feed：顶栏 Tab + 健康横幅 + 分类 + 卡片流。
 * following Tab 按关注表驱动（currentUser.followingIds），空则提示条 + 推荐流兜底。
 */
export function FeedPage() {
  const posts = useAppStore((s) => s.posts);
  const activeTab = useAppStore((s) => s.activeTab);
  const activeCategory = useAppStore((s) => s.activeCategory);
  const followingIds = useAppStore((s) => s.currentUser.followingIds);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list =
      activeTab === 'following'
        ? posts.filter((p) => followingIds.includes(p.authorId)) // 关注表驱动（替换 source 冒充）
        : posts.filter((p) => p.source === activeTab);
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    const k = search.trim().toLowerCase();
    if (k) {
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(k) ||
          p.tags.some((t) => t.toLowerCase().includes(k)) ||
          p.petTag.toLowerCase().includes(k),
      );
    }
    return list;
  }, [posts, activeTab, activeCategory, search, followingIds]);

  // 关注流空态：提示条 + 推荐流兜底（不白屏）
  const isFollowingEmpty = activeTab === 'following' && filtered.length === 0;
  const fallbackPosts = useMemo(() => posts.filter((p) => p.source === 'recommend'), [posts]);

  return (
    <div>
      <TopBar search={search} onSearchChange={setSearch} />
      <HealthBanner />
      <CategoryFilter />
      {isFollowingEmpty ? (
        <>
          <div className="bg-bg px-4 pb-2">
            <div className="rounded-pill bg-warning-bg px-3 py-2 text-center text-xs text-warning">
              关注感兴趣的主人来这里看 TA 的动态
            </div>
          </div>
          <FeedList posts={fallbackPosts} />
        </>
      ) : (
        <FeedList posts={filtered} />
      )}
    </div>
  );
}
