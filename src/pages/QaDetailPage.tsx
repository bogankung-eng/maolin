import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { getUserById } from '@/mock/data';
import { CategoryLabel, CategoryColor, CategoryBg, Icons } from '@/lib/icons';
import type { Answer } from '@/types';

/** 问答详情：问题 + 回答列表 + 标记最佳/紧急 + 新增回答 */
export function QaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = useAppStore((s) => s.questions.find((q) => q.id === id));
  const currentUser = useAppStore((s) => s.currentUser);
  const markBestAnswer = useAppStore((s) => s.markBestAnswer);
  const markUrgent = useAppStore((s) => s.markUrgent);
  const addAnswer = useAppStore((s) => s.addAnswer);
  const showToast = useAppStore((s) => s.showToast);
  const [answerText, setAnswerText] = useState('');

  if (!question) {
    return (
      <div className="p-6 text-center text-text-tertiary">
        问题不存在
        <div className="mt-4">
          <button onClick={() => navigate(-1)} className="text-brand">
            返回
          </button>
        </div>
      </div>
    );
  }

  const isOwner = question.authorId === currentUser.id;
  const sortedAnswers = [...question.answers].sort(
    (a, b) => (b.isBest ? 1 : 0) - (a.isBest ? 1 : 0),
  );

  const statusBadge =
    question.status === 'resolved'
      ? { text: '已解决', tone: 'resolved' as const }
      : question.status === 'urgent'
        ? { text: '紧急', tone: 'urgent' as const }
        : { text: '待解答', tone: 'open' as const };

  const submitAnswer = () => {
    const text = answerText.trim();
    if (!text) {
      showToast('请输入回答内容');
      return;
    }
    addAnswer(question.id, { content: text });
    setAnswerText('');
    showToast('回答已发布');
  };

  return (
    <div className="min-h-full bg-surface">
      {/* 顶部返回栏 */}
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-surface px-4">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-secondary">
          ←
        </button>
        <span className="text-base font-semibold text-text">问答详情</span>
      </header>

      {/* 问题区 */}
      <div className="px-4 pt-4">
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
          <Badge tone={statusBadge.tone}>{statusBadge.text}</Badge>
        </div>
        <h1 className="mt-2 text-base font-semibold leading-snug text-text">{question.title}</h1>
        {question.content && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {question.content}
          </p>
        )}

        {/* 提问者操作（标记最佳 / 标记紧急） */}
        {isOwner && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                markUrgent(question.id);
                showToast('已标记为紧急');
              }}
            >
              标记紧急
            </Button>
            {question.status !== 'resolved' && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (question.answers.length === 0) {
                    showToast('暂无回答可标记');
                    return;
                  }
                  showToast('请在回答中选择「设为最佳」');
                }}
              >
                标记已解决
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 回答列表 */}
      <section className="mt-4 border-t border-border px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold text-text">{question.answers.length} 个回答</h3>
        {sortedAnswers.length === 0 ? (
          <div className="text-sm text-text-tertiary">还没有回答，快来帮忙解答～</div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedAnswers.map((a: Answer) => (
              <AnswerCard
                key={a.id}
                answer={a}
                canMarkBest={isOwner && !a.isBest && question.status !== 'resolved'}
                onMarkBest={() => {
                  markBestAnswer(question.id, a.id);
                  showToast('已标记最佳答案，问题已解决');
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 新增回答 */}
      <section className="bottom-safe-nav sticky border-t border-border bg-surface px-4 py-4">
        <div className="flex gap-2">
          <input
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="写下你的回答…"
            className="transition-bg flex-1 rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
          <button
            onClick={submitAnswer}
            className="rounded-button bg-brand px-4 text-sm text-white"
          >
            发布
          </button>
        </div>
      </section>
    </div>
  );
}

function AnswerCard({
  answer,
  canMarkBest,
  onMarkBest,
}: {
  answer: Answer;
  canMarkBest: boolean;
  onMarkBest: () => void;
}) {
  const author = getUserById(answer.authorId);
  return (
    <div className="rounded-button bg-bg p-3">
      <div className="flex items-center gap-2">
        <Avatar emoji={author.avatarEmoji} size={32} />
        <span className="text-sm font-medium text-text">{author.name}</span>
        {answer.isVet && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-brand-dark">
            {Icons.vet} 兽医
          </span>
        )}
        {answer.isBest && <Badge tone="resolved">最佳答案</Badge>}
        {answer.isBest && (
          <span
            className={`rounded-pill px-2 py-0.5 text-xs font-medium ${
              answer.isVet ? 'bg-brand-light text-brand' : 'bg-bg text-text-secondary'
            }`}
          >
            {answer.isVet ? '+50 分 · 最佳答主' : '+20 分 · 优质回答'}
          </span>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text">{answer.content}</p>
      {canMarkBest && (
        <button
          onClick={onMarkBest}
          className="transition-bg mt-2 rounded-pill border border-brand px-3 py-1 text-xs text-brand"
        >
          设为最佳答案
        </button>
      )}
    </div>
  );
}
