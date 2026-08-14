import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { PublishSheet } from '@/components/publish/PublishSheet';
import { ShareSheet } from '@/components/common/ShareSheet';
import { Toast } from '@/components/common/Toast';

/**
 * 应用外壳：桌面端居中容器（max-width 420 模拟手机画布），
 * 内部含滚动主区、底部导航、发布弹层与 Toast。
 */
export function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen w-full justify-center bg-[#ECEAE4]">
      <div className="relative flex h-screen w-full max-w-app flex-col overflow-hidden bg-bg">
        {/* 主滚动区：key 随路由变化，切换时淡入 200ms */}
        <main className="no-scrollbar flex-1 overflow-y-auto pb-safe-nav">
          <div key={location.pathname} className="animate-fade">
            <Outlet />
          </div>
        </main>
        {/* 底部导航 */}
        <BottomNav />
        {/* 全局发布弹层 */}
        <PublishSheet />
        {/* 全局分享弹层 */}
        <ShareSheet />
        {/* 全局 Toast */}
        <Toast />
      </div>
    </div>
  );
}
