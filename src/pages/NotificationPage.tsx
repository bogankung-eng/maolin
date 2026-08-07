import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { NotificationIcon } from '@/lib/icons';
import { formatRelativeTime } from '@/lib/time';
import type { Notification } from '@/types';

/** 通知跳转映射：post→/post/:id、question→/qa/:id、pet→/pet/:id */
function targetPath(n: Notification): string {
  if (n.targetType === 'post') return `/post/${n.targetId}`;
  if (n.targetType === 'question') return `/qa/${n.targetId}`;
  return `/pet/${n.targetId}`;
}

/**
 * 通知中心（P0-4）：
 * - 进入即 markAllNotificationsRead（幂等，StrictMode 双调用安全）
 * - 按 createdAt 倒序；4 类通知 emoji 图标；未读品牌绿圆点
 * - 点击按 targetType 跳转
 */
export function NotificationPage() {
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  useEffect(() => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="min-h-full bg-surface">
      {/* 顶部返回栏 */}
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-surface px-4">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-secondary">
          ←
        </button>
        <span className="text-base font-semibold text-text">通知</span>
      </header>

      {sorted.length === 0 ? (
        <div className="py-10 text-center text-sm text-text-tertiary">暂时没有新通知</div>
      ) : (
        <div>
          {sorted.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(targetPath(n))}
              className="flex w-full items-center gap-3 border-b border-border bg-surface px-4 py-3 text-left"
            >
              <span className="text-xl">{NotificationIcon[n.type]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-text">{n.message}</span>
                <span className="mt-0.5 block text-[11px] text-text-tertiary">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </span>
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
