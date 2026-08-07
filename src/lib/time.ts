import { formatDate } from '@/lib/mockApi';

/**
 * 相对时间格式化（评论 / 通知统一使用，不散写格式化逻辑）。
 * - <1 分钟：刚刚
 * - <1 小时：N 分钟前
 * - <1 天：N 小时前
 * - <30 天：N 天前
 * - 超过 30 天：回退 formatDate（YYYY-MM-DD）
 */
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  if (diff < MIN) return '刚刚';
  if (diff < HOUR) return `${Math.floor(diff / MIN)} 分钟前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} 天前`;
  return formatDate(iso);
}
