import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { QaList } from '@/components/qa/QaList';
import { QaStatusFilter } from '@/components/qa/QaStatusFilter';
import { Icon } from '@/components/common/Icon';
import type { QaFilter } from '@/types';

/** 问答社区：提问入口 + 分类 + 状态筛选 + 列表 + 搜索 */
export function QaPage() {
  const questions = useAppStore((s) => s.questions);
  const qaCategory = useAppStore((s) => s.qaCategory);
  const qaKeyword = useAppStore((s) => s.qaKeyword);
  const setQaCategory = useAppStore((s) => s.setQaCategory);
  const setQaKeyword = useAppStore((s) => s.setQaKeyword);
  const openPublish = useAppStore((s) => s.openPublish);
  const [showSearch, setShowSearch] = useState(false);
  // 状态筛选为页面级本地 state（不持久化、不入 store），与分类筛选叠加
  const [qaStatus, setQaStatus] = useState<QaFilter>('all');

  const filtered = useMemo(() => {
    let list = questions;
    if (qaCategory !== 'all') {
      list = list.filter((q) => q.category === qaCategory);
    }
    if (qaStatus !== 'all') {
      list = list.filter((q) => q.status === qaStatus);
    }
    const k = qaKeyword.trim().toLowerCase();
    if (k) {
      list = list.filter(
        (q) => q.title.toLowerCase().includes(k) || q.content.toLowerCase().includes(k),
      );
    }
    return list;
  }, [questions, qaCategory, qaStatus, qaKeyword]);

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-bg">
        <div className="flex h-[52px] items-center justify-between px-4">
          <span className="text-lg font-bold text-text">问答社区</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="text-lg text-text-secondary"
              aria-label="搜索"
            >
              <Icon name="search" size={22} />
            </button>
            <button
              onClick={() => openPublish('question')}
              className="flex items-center gap-1 rounded-button bg-brand px-3 py-1 text-sm text-white"
            >
              <Icon name="plus" size={14} />
              提问
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="px-4 pb-2">
            <input
              autoFocus
              value={qaKeyword}
              onChange={(e) => setQaKeyword(e.target.value)}
              placeholder="搜索问题"
              className="transition-bg w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
            />
          </div>
        )}
      </header>

      <CategoryFilter value={qaCategory} onChange={setQaCategory} />
      <QaStatusFilter value={qaStatus} onChange={setQaStatus} />
      <QaList questions={filtered} />
    </div>
  );
}
