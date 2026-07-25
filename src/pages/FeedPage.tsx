import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TopBar } from '@/components/layout/TopBar';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { FeedList } from '@/components/feed/FeedList';

/** 首页 Feed：顶栏 Tab + 分类 + 卡片流 */
export function FeedPage() {
  const posts = useAppStore((s) => s.posts);
  const activeTab = useAppStore((s) => s.activeTab);
  const activeCategory = useAppStore((s) => s.activeCategory);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = posts.filter((p) => p.source === activeTab);
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    const k = search.trim().toLowerCase();
    if (k) {
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(k) ||
          p.tags.some((t) => t.toLowerCase().includes(k)) ||
          p.petTag.toLowerCase().includes(k)
      );
    }
    return list;
  }, [posts, activeTab, activeCategory, search]);

  return (
    <div>
      <TopBar search={search} onSearchChange={setSearch} />
      <CategoryFilter />
      <FeedList posts={filtered} />
    </div>
  );
}
