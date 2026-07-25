import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { PublishSheet } from '@/components/publish/PublishSheet';
import { Toast } from '@/components/common/Toast';

/**
 * 应用外壳：桌面端居中容器（max-width 420 模拟手机画布），
 * 内部含滚动主区、底部导航、发布弹层与 Toast。
 */
export function AppShell() {
  return (
    <div className="min-h-screen w-full flex justify-center bg-[#ECEAE4]">
      <div className="relative w-full max-w-app bg-bg h-screen flex flex-col overflow-hidden">
        {/* 主滚动区 */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-[72px]">{<Outlet />}</main>
        {/* 底部导航 */}
        <BottomNav />
        {/* 全局发布弹层 */}
        <PublishSheet />
        {/* 全局 Toast */}
        <Toast />
      </div>
    </div>
  );
}
