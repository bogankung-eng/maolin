import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { CategoryLabel, CategoryColor, CategoryBg } from '@/lib/icons';
import type { Question } from '@/types';

/** 问答条目：状态徽章 + 分类色标签 + 回答数 + 兽医标识 */
export function QaItem({ question }: { question: Question }) {
  const navigate = useNavigate();
  const hasVet = question.answers.some((a) => a.isVet);

  const statusMeta =
    question.status === 'resolved'
      ? { text: '已解决', tone: 'resolved' as const }
      : question.status === 'urgent'
        ? { text: '紧急', tone: 'urgent' as const }
        : { text: '待解答', tone: 'open' as const };

  return (
    <div
      onClick={() => navigate(`/qa/${question.id}`)}
      className="bg-surface border-b border-border px-4 py-[14px] cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-pill"
          style={{ color: CategoryColor[question.category], background: CategoryBg[question.category] }}
        >
          {CategoryIconLabel(question.category)}
        </span>
        <Badge tone={statusMeta.tone}>{statusMeta.text}</Badge>
      </div>

      <h3 className="mt-2 text-sm font-medium text-text leading-snug line-clamp-2">
        {question.title}
      </h3>

      <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
        <span>{question.answers.length} 回答</span>
        {hasVet && (
          <span className="text-brand-dark font-medium">兽医✓ 已回答</span>
        )}
      </div>
    </div>
  );
}

function CategoryIconLabel(c: Question['category']): string {
  return CategoryLabel[c];
}
