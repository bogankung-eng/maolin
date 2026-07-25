import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Icons } from '@/lib/icons';
import type { FeedTab } from '@/types';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'following', label: '关注' },
  { key: 'local', label: '同城' },
];

/** 顶栏：Logo + 推荐/关注/同城 Tab + 搜索图标（内联过滤） */
export function TopBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-bg">
      <div className="flex items-center justify-between px-4 h-[52px]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-brand">毛邻</span>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`text-sm px-1 transition-bg ${
                  activeTab === t.key
                    ? 'text-text font-semibold'
                    : 'text-text-tertiary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => setShowSearch((s) => !s)}
          className="text-lg text-text-secondary"
          aria-label="搜索"
        >
          {Icons.search}
        </button>
      </div>
      {showSearch && (
        <div className="px-4 pb-2">
          <input
            autoFocus
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索当前列表内容"
            className="w-full bg-surface border border-border rounded-button px-3 py-2 text-sm text-text outline-none focus:border-brand transition-bg"
          />
        </div>
      )}
    </header>
  );
}
