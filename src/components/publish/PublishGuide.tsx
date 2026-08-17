import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

/**
 * 发帖成功引导条（产品 P4）：发布成功后展示，5s 自动消失，可手动关闭。
 * 自包含（读 store），不进 persist；「查看我的/去互动/继续发布」三入口。
 */
export function PublishGuide() {
  const navigate = useNavigate();
  const guide = useAppStore((s) => s.publishGuide);
  const hidePublishGuide = useAppStore((s) => s.hidePublishGuide);
  const openPublish = useAppStore((s) => s.openPublish);

  useEffect(() => {
    if (!guide.open) return;
    const t = setTimeout(() => hidePublishGuide(), 5000);
    return () => clearTimeout(t);
  }, [guide.open, hidePublishGuide]);

  if (!guide.open) return null;

  return (
    <div className="absolute inset-x-0 bottom-safe-nav z-40 px-4">
      <div className="animate-slide-up flex items-center justify-between gap-2 rounded-button border border-border bg-surface px-3 py-2.5 shadow-lg">
        <span className="text-sm font-medium text-text">发布成功！</span>
        <div className="flex shrink-0 items-center gap-3 text-xs">
          <button onClick={() => navigate('/profile')} className="text-brand">
            查看我的
          </button>
          <button onClick={() => navigate('/feed')} className="text-brand">
            去互动
          </button>
          <button
            onClick={() => {
              hidePublishGuide();
              openPublish('post');
            }}
            className="text-brand"
          >
            继续发布
          </button>
          <button
            onClick={hidePublishGuide}
            aria-label="关闭引导"
            className="text-text-tertiary"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
