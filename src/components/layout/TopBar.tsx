import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { selectUnreadCount, selectTheme } from '@/store/selectors';
import { Icon } from '@/components/common/Icon';
import { Logo } from '@/components/common/Logo';
import type { FeedTab, ThemeMode } from '@/types';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'following', label: '关注' },
  { key: 'local', label: '同城' },
];

/** 主题三态循环：light → dark → system → light */
const THEME_NEXT: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const THEME_ICON: Record<ThemeMode, 'sun' | 'moon' | 'monitor'> = {
  light: 'sun',
  dark: 'moon',
  system: 'monitor',
};

/** 顶栏：Logo + 推荐/关注/同城 Tab + 主题切换 + 铃铛（未读角标）+ 搜索图标（跳转 /search） */
export function TopBar() {
  const navigate = useNavigate();
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const unread = useAppStore(selectUnreadCount);
  const theme = useAppStore(selectTheme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <header className="sticky top-0 z-10 bg-bg">
      <div className="flex h-[52px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-brand">
            <Logo size={22} />
            <span className="text-lg font-bold">毛邻</span>
          </span>
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
            onClick={() => setTheme(THEME_NEXT[theme])}
            className="text-lg text-text-secondary"
            aria-label="切换主题"
          >
            <Icon name={THEME_ICON[theme]} size={22} />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-lg text-text-secondary"
            aria-label="通知"
          >
            <Icon name="bell" size={22} />
            {unread > 0 && (
              <span className="absolute -right-2 -top-1 rounded-full bg-error px-1 text-[11px] leading-4 text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/search')}
            className="text-lg text-text-secondary"
            aria-label="搜索"
          >
            <Icon name="search" size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
