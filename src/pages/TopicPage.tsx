import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { PostCard } from '@/components/feed/PostCard';
import { QaItem } from '@/components/qa/QaItem';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryLabel } from '@/lib/icons';

/** 话题页（F2）：/topic/:tag 聚合含该标签的帖子 + 标题/内容/分类命中的问答 */
export function TopicPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const posts = useAppStore((s) => s.posts);
  const questions = useAppStore((s) => s.questions);
  const openPublish = useAppStore((s) => s.openPublish);

  const decoded = decodeURIComponent(tag ?? '');

  const matchedPosts = useMemo(
    () => posts.filter((p) => p.tags.includes(decoded)),
    [posts, decoded],
  );

  const matchedQuestions = useMemo(() => {
    const k = decoded.toLowerCase();
    return questions.filter(
      (q) =>
        q.title.toLowerCase().includes(k) ||
        q.content.toLowerCase().includes(k) ||
        CategoryLabel[q.category].toLowerCase().includes(k),
    );
  }, [questions, decoded]);

  const isEmpty = matchedPosts.length === 0 && matchedQuestions.length === 0;

  return (
    <div className="min-h-full bg-bg">
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-bg px-4">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-secondary" aria-label="返回">
          <Icon name="chevronLeft" size={20} />
        </button>
        <span className="text-base font-semibold text-text">话题 #{decoded}</span>
      </header>

      <div className="px-4 py-2 text-xs text-text-secondary">
        {matchedPosts.length} 条帖子 · {matchedQuestions.length} 条问答
      </div>

      {isEmpty ? (
        <EmptyState
          title="这个话题还没有内容"
          action={
            <>
              <button
                onClick={() => openPublish('post')}
                className="rounded-button bg-brand px-4 py-2 text-sm text-white"
              >
                去发帖
              </button>
              <button
                onClick={() => openPublish('question')}
                className="rounded-button bg-brand-light px-4 py-2 text-sm text-brand-dark"
              >
                去提问
              </button>
            </>
          }
        />
      ) : (
        <div>
          {matchedPosts.length > 0 && (
            <section>
              <h2 className="px-4 py-2 text-xs font-semibold text-text-secondary">帖子</h2>
              {matchedPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </section>
          )}
          {matchedQuestions.length > 0 && (
            <section>
              <h2 className="px-4 py-2 text-xs font-semibold text-text-secondary">问答</h2>
              {matchedQuestions.map((q) => (
                <QaItem key={q.id} question={q} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
