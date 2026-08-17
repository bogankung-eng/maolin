import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { CategoryLabel, CategoryColor, CategoryBg } from '@/lib/icons';
import type { Question } from '@/types';

/** 问答条目：状态徽章 + 分类色标签 + 标题 Link + 详情摘要 + 回答数 + 兽医标识（article 语义化） */
export function QaItem({ question }: { question: Question }) {
  const hasVet = question.answers.some((a) => a.isVet);

  const statusMeta =
    question.status === 'resolved'
      ? { text: '已解决', tone: 'resolved' as const }
      : question.status === 'urgent'
        ? { text: '紧急', tone: 'urgent' as const }
        : { text: '待解答', tone: 'open' as const };

  return (
    <article className="border-b border-border bg-surface px-4 py-[14px]">
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-pill px-2 py-0.5 text-xs"
          style={{
            color: CategoryColor[question.category],
            background: CategoryBg[question.category],
          }}
        >
          {CategoryLabel[question.category]}
        </span>
        <Badge tone={statusMeta.tone}>{statusMeta.text}</Badge>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-text">
        <Link to={`/qa/${question.id}`}>{question.title}</Link>
      </h3>

      {question.content && (
        <p className="mt-1 line-clamp-1 text-xs text-text-tertiary">{question.content}</p>
      )}

      <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
        <span>{question.answers.length} 回答</span>
        {hasVet && (
          <span className="font-medium text-brand-dark">
            兽医 <Icon name="vet" size={14} /> 已回答
          </span>
        )}
        <span className="ml-auto">
          <FavoriteButton type="question" id={question.id} size="sm" />
        </span>
      </div>
    </article>
  );
}
