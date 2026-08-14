import { Logo } from '@/components/common/Logo';

/** 懒加载 Suspense fallback：猫爪呼吸 + 居中「加载中…」占位（无骨架屏，≤300ms 不闪动） */
export function PageFallback() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-16 text-sm text-text-tertiary">
      <Logo size={48} className="animate-breathe text-brand" />
      加载中…
    </div>
  );
}
