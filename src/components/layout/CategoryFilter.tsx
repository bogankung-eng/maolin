import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon, CategoryLabel } from '@/lib/icons';
import type { Category } from '@/types';

const CATEGORIES: Category[] = ['health', 'diet', 'behavior', 'gear', 'medical'];

/**
 * 分类 Pill 横滚筛选。
 * 不传 value/onChange 时复用 store 的 activeCategory（Feed 页）；
 * 传入时用于 QA 页的 qaCategory。
 */
export function CategoryFilter({
  value,
  onChange,
}: {
  value?: Category | 'all';
  onChange?: (c: Category | 'all') => void;
}) {
  const storeCat = useAppStore((s) => s.activeCategory);
  const setStoreCat = useAppStore((s) => s.setActiveCategory);
  const active = value ?? storeCat;
  const setActive = onChange ?? setStoreCat;

  const items: { key: Category | 'all'; label: string; icon?: string }[] = [
    { key: 'all', label: '全部' },
    ...CATEGORIES.map((c) => ({ key: c, label: CategoryLabel[c], icon: CategoryIcon[c] })),
  ];

  return (
    <div className="bg-bg">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => setActive(it.key)}
              className={`transition-bg flex items-center gap-1 whitespace-nowrap rounded-pill border px-3 py-1.5 text-sm ${
                isActive
                  ? 'border-brand bg-brand text-white shadow-[0_2px_8px_rgba(29,158,117,0.3)]'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              {it.icon && <span>{it.icon}</span>}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
