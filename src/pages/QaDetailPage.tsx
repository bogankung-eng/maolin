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
    (a, b) => (b.isBest ? 1 : 0) - (a.isBest ? 1 : 0)
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
      <header className="sticky top-0 z-10 bg-surface border-b border-border flex items-center h-[52px] px-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary mr-3">
          ←
        </button>
        <span className="text-base font-semibold text-text">问答详情</span>
      </header>

      {/* 问题区 */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-pill"
            style={{ color: CategoryColor[question.category], background: CategoryBg[question.category] }}
          >
            {CategoryLabel[question.category]}
          </span>
          <Badge tone={statusBadge.tone}>{statusBadge.text}</Badge>
        </div>
        <h1 className="mt-2 text-base font-semibold text-text leading-snug">
          {question.title}
        </h1>
        {question.content && (
          <p className="mt-2 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {question.content}
          </p>
        )}

        {/* 提问者操作（标记最佳 / 标记紧急） */}
        {isOwner && (
          <div className="flex gap-2 mt-3">
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
      <section className="px-4 py-4 border-t border-border mt-4">
        <h3 className="text-sm font-semibold text-text mb-3">
          {question.answers.length} 个回答
        </h3>
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
                  showToast('已设为最佳答案');
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 新增回答 */}
      <section className="px-4 py-4 border-t border-border sticky bottom-[72px] bg-surface">
        <div className="flex gap-2">
          <input
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="写下你的回答…"
            className="flex-1 bg-bg border border-border rounded-button px-3 py-2 text-sm text-text outline-none focus:border-brand transition-bg"
          />
          <button onClick={submitAnswer} className="bg-brand text-white rounded-button px-4 text-sm">
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
    <div className="bg-bg rounded-button p-3">
      <div className="flex items-center gap-2">
        <Avatar emoji={author.avatarEmoji} size={32} />
        <span className="text-sm font-medium text-text">{author.name}</span>
        {answer.isVet && (
          <span className="text-xs text-brand-dark font-semibold flex items-center gap-0.5">
            {Icons.vet} 兽医
          </span>
        )}
        {answer.isBest && <Badge tone="resolved">最佳答案</Badge>}
      </div>
      <p className="mt-2 text-sm text-text leading-relaxed whitespace-pre-wrap">
        {answer.content}
      </p>
      {canMarkBest && (
        <button
          onClick={onMarkBest}
          className="mt-2 text-xs text-brand border border-brand rounded-pill px-3 py-1 transition-bg"
        >
          设为最佳答案
        </button>
      )}
    </div>
  );
}
