import { computeHealthStatus } from '@/types';
import { formatDate } from '@/lib/mockApi';
import type { HealthRecord, HealthStatus } from '@/types';

const STATUS_META: Record<HealthStatus, { text: string; bg: string; color: string }> = {
  normal: { text: '正常', bg: 'var(--color-resolved-bg)', color: 'var(--color-resolved-text)' },
  'due-soon': { text: '即将到期', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  overdue: { text: '已超期', bg: 'var(--color-urgent-bg)', color: 'var(--color-urgent-text)' },
  none: { text: '未设置', bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
};

/** 健康记录列表：状态色展示 */
export function HealthRecordList({ records }: { records: HealthRecord[] }) {
  if (records.length === 0) {
    return <div className="text-sm text-text-tertiary">暂无健康记录</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {records.map((r) => {
        const status = computeHealthStatus(r);
        const meta = STATUS_META[status];
        return (
          <div
            key={r.id}
            className="flex items-center justify-between bg-surface border border-border rounded-button px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm text-text">{r.title}</div>
              {r.date && (
                <div className="text-xs text-text-tertiary mt-0.5">
                  提醒日期：{formatDate(r.date)}
                </div>
              )}
              {r.value && (
                <div className="text-xs text-text-tertiary mt-0.5">数值：{r.value}</div>
              )}
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-pill shrink-0 ml-2"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
