import { useMemo } from 'react';
import { QaItem } from './QaItem';
import type { Question } from '@/types';

/** 问答列表：紧急置顶 + 时间倒序 */
export function QaList({ questions }: { questions: Question[] }) {
  const sorted = useMemo(
    () =>
      [...questions].sort((a, b) => {
        if (a.status === 'urgent' && b.status !== 'urgent') return -1;
        if (b.status === 'urgent' && a.status !== 'urgent') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [questions]
  );

  if (sorted.length === 0) {
    return <div className="text-center text-text-tertiary py-10 text-sm">暂无相关问题</div>;
  }

  return (
    <div>
      {sorted.map((q) => (
        <QaItem key={q.id} question={q} />
      ))}
    </div>
  );
}
