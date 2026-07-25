import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Icons } from '@/lib/icons';
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
    <nav className="absolute bottom-0 inset-x-0 h-[72px] bg-surface border-t border-border flex items-center px-2 z-20">
      <button className={itemClass(isFeed && activeTab === 'recommend')} onClick={() => goFeed('recommend')}>
        <span className="text-xl">{Icons.home}</span>
        <span>首页</span>
      </button>
      <button className={itemClass(isQa)} onClick={() => navigate('/qa')}>
        <span className="text-xl">{Icons.chat}</span>
        <span>问答</span>
      </button>

      {/* 居中发布按钮（绿色圆角方块） */}
      <button
        onClick={() => openPublish('post')}
        className="flex-1 flex items-center justify-center"
        aria-label="发布"
      >
        <span className="w-12 h-12 rounded-button bg-brand text-white text-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(29,158,117,0.4)]">
          {Icons.plus}
        </span>
      </button>

      <button className={itemClass(isFeed && activeTab === 'local')} onClick={() => goFeed('local')}>
        <span className="text-xl">{Icons.location}</span>
        <span>同城</span>
      </button>
      <button className={itemClass(isProfile)} onClick={() => navigate('/profile')}>
        <span className="text-xl">{Icons.user}</span>
        <span>我的</span>
      </button>
    </nav>
  );
}
