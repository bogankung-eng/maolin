import type { QaFilter } from '@/types';

const STATUSES: { key: QaFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'open', label: '待解答' },
  { key: 'resolved', label: '已解决' },
  { key: 'urgent', label: '紧急' },
];

/**
 * 问答状态筛选（P0-5）：全部 / 待解答 / 已解决 / 紧急。
 * 激活样式复用 CategoryFilter（品牌绿底白字 + 绿阴影，transition 180ms）。
 * qaStatus 为页面级本地 state（不持久化、不入 store）。
 */
export function QaStatusFilter({
  value,
  onChange,
}: {
  value: QaFilter;
  onChange: (v: QaFilter) => void;
}) {
  return (
    <div className="bg-bg">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
        {STATUSES.map((s) => {
          const isActive = value === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              className={`transition-bg flex items-center gap-1 whitespace-nowrap rounded-pill border px-3 py-1.5 text-sm ${
                isActive
                  ? 'border-brand bg-brand text-white shadow-[0_2px_8px_rgba(29,158,117,0.3)]'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
