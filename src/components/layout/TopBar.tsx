import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Icons } from '@/lib/icons';
import type { FeedTab } from '@/types';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'following', label: '关注' },
  { key: 'local', label: '同城' },
];

/** 顶栏：Logo + 推荐/关注/同城 Tab + 铃铛（未读角标）+ 搜索图标（内联过滤） */
export function TopBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const navigate = useNavigate();
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const notifications = useAppStore((s) => s.notifications);
  const [showSearch, setShowSearch] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-10 bg-bg">
      <div className="flex h-[52px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-brand">毛邻</span>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`transition-bg px-1 text-sm ${
                  activeTab === t.key ? 'font-semibold text-text' : 'text-text-tertiary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-lg text-text-secondary"
            aria-label="通知"
          >
            {Icons.bell}
            {unread > 0 && (
              <span className="absolute -right-2 -top-1 rounded-full bg-[#E24B4A] px-1 text-[11px] leading-4 text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSearch((s) => !s)}
            className="text-lg text-text-secondary"
            aria-label="搜索"
          >
            {Icons.search}
          </button>
        </div>
      </div>
      {showSearch && (
        <div className="px-4 pb-2">
          <input
            autoFocus
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索当前列表内容"
            className="transition-bg w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
        </div>
      )}
    </header>
  );
}
