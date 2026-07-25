import { useAppStore } from '@/store/useAppStore';

/** 轻提示：fade + translate 300ms，2.2s 后自动淡出 */
export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast.visible) return null;
  return (
    <div className="absolute left-1/2 bottom-24 z-[60] animate-toast pointer-events-none">
      <div className="bg-text/90 text-white text-sm px-4 py-2 rounded-button shadow-lg whitespace-nowrap">
        {toast.message}
      </div>
    </div>
  );
}
