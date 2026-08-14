import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Icon } from '@/components/common/Icon';
import type { FeedTab } from '@/types';

/**
 * 底部 5 Tab：🏠→/feed(推荐) 💬→/qa ＋→发布弹层 📍→/feed(同城) 👤→/profile
 * 「＋」为绿色圆角方块居中常驻。
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const openPublish = useAppStore((s) => s.openPublish);

  const isFeed = location.pathname === '/feed' || location.pathname === '/';
  const isQa = location.pathname === '/qa' || location.pathname.startsWith('/qa/');
  const isProfile = location.pathname === '/profile';

  const goFeed = (tab: FeedTab) => {
    setActiveTab(tab);
    navigate('/feed');
  };

  const itemClass = (active: boolean) =>
    `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${
      active ? 'text-brand' : 'text-text-tertiary'
    }`;

  return (
    <nav className="h-safe-nav absolute inset-x-0 bottom-0 z-20 flex items-center border-t border-border bg-surface px-2 pb-[env(safe-area-inset-bottom)]">
      <button
        className={itemClass(isFeed && activeTab === 'recommend')}
        onClick={() => goFeed('recommend')}
      >
        <span className="text-xl"><Icon name="home" size={22} /></span>
        <span>首页</span>
      </button>
      <button className={itemClass(isQa)} onClick={() => navigate('/qa')}>
        <span className="text-xl"><Icon name="chat" size={22} /></span>
        <span>问答</span>
      </button>

      {/* 居中发布按钮（绿色圆角方块） */}
      <button
        onClick={() => openPublish('post')}
        className="flex flex-1 items-center justify-center"
        aria-label="发布"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-button bg-brand text-2xl text-white shadow-[0_4px_12px_rgba(29,158,117,0.4)]">
          <Icon name="plus" size={26} />
        </span>
      </button>

      <button
        className={itemClass(isFeed && activeTab === 'local')}
        onClick={() => goFeed('local')}
      >
        <span className="text-xl"><Icon name="location" size={22} /></span>
        <span>同城</span>
      </button>
      <button className={itemClass(isProfile)} onClick={() => navigate('/profile')}>
        <span className="text-xl"><Icon name="user" size={22} /></span>
        <span>我的</span>
      </button>
    </nav>
  );
}
