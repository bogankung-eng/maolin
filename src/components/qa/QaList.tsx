import { useMemo } from 'react';
import { QaItem } from './QaItem';
import { Skeleton } from '@/components/common/Skeleton';
import type { Question } from '@/types';

/** 骨架行（role=status 供读屏感知加载中） */
function QaSkeletonRow() {
  return (
    <div className="border-b border-border bg-surface px-4 py-[14px]">
      <Skeleton className="h-4 w-20 rounded-pill" />
      <Skeleton className="mt-2 h-4 w-full rounded-pill" />
      <Skeleton className="mt-2 h-3 w-2/3 rounded-pill" />
    </div>
  );
}

/**
 * 问答列表：紧急置顶 + 时间倒序。
 * loading=true 时渲染骨架屏行（P3 QA 加载，配合 QaPage useTransition）。
 */
export function QaList({ questions, loading = false }: { questions: Question[]; loading?: boolean }) {
  const sorted = useMemo(
    () =>
      [...questions].sort((a, b) => {
        if (a.status === 'urgent' && b.status !== 'urgent') return -1;
        if (b.status === 'urgent' && a.status !== 'urgent') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [questions],
  );

  if (loading) {
    return (
      <div role="status" aria-label="加载中">
        {[0, 1, 2].map((i) => (
          <QaSkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return <div className="py-10 text-center text-sm text-text-tertiary">暂无相关问题</div>;
  }

  return (
    <div>
      {sorted.map((q) => (
        <QaItem key={q.id} question={q} />
      ))}
    </div>
  );
}
