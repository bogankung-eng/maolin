import { useAppStore } from '@/store/useAppStore';

/** 轻提示：fade + translate 300ms，2.2s 后自动淡出 */
export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast.visible) return null;
  return (
    <div className="animate-toast pointer-events-none absolute bottom-toast left-1/2 z-[60]">
      <div className="bg-text/90 whitespace-nowrap rounded-button px-4 py-2 text-sm text-white shadow-lg">
        {toast.message}
      </div>
    </div>
  );
}
