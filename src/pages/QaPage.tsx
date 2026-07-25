import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { QaList } from '@/components/qa/QaList';
import { Icons } from '@/lib/icons';

/** 问答社区：提问入口 + 分类 + 列表 + 搜索 */
export function QaPage() {
  const questions = useAppStore((s) => s.questions);
  const qaCategory = useAppStore((s) => s.qaCategory);
  const qaKeyword = useAppStore((s) => s.qaKeyword);
  const setQaCategory = useAppStore((s) => s.setQaCategory);
  const setQaKeyword = useAppStore((s) => s.setQaKeyword);
  const openPublish = useAppStore((s) => s.openPublish);
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    let list = questions;
    if (qaCategory !== 'all') {
      list = list.filter((q) => q.category === qaCategory);
    }
    const k = qaKeyword.trim().toLowerCase();
    if (k) {
      list = list.filter(
        (q) => q.title.toLowerCase().includes(k) || q.content.toLowerCase().includes(k)
      );
    }
    return list;
  }, [questions, qaCategory, qaKeyword]);

  return (
    <div>
      <header className="sticky top-0 z-10 bg-bg border-b border-border">
        <div className="flex items-center justify-between px-4 h-[52px]">
          <span className="text-lg font-bold text-text">问答社区</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="text-lg text-text-secondary"
              aria-label="搜索"
            >
              {Icons.search}
            </button>
            <button
              onClick={() => openPublish('question')}
              className="bg-brand text-white rounded-button px-3 py-1 text-sm"
            >
              提问＋
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
              className="w-full bg-surface border border-border rounded-button px-3 py-2 text-sm text-text outline-none focus:border-brand transition-bg"
            />
          </div>
        )}
      </header>

      <CategoryFilter value={qaCategory} onChange={setQaCategory} />
      <QaList questions={filtered} />
    </div>
  );
}
