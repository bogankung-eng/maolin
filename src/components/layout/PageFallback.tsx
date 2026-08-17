import { Mascot } from '@/components/common/Mascot';
import { Skeleton } from '@/components/common/Skeleton';

/** 懒加载 Suspense fallback：吉祥物「爪爪」挥手 + 骨架条 + 居中提示（无闪动） */
export function PageFallback() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-16 text-sm text-text-tertiary">
      <Mascot pose="wave" size={56} className="animate-breathe text-brand" />
      <div className="w-40">
        <Skeleton className="h-3 w-full rounded-pill" />
        <Skeleton className="mt-2 h-3 w-3/4 rounded-pill" />
      </div>
      <span>加载中…</span>
    </div>
  );
}
