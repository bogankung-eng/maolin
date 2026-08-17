import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { userMap } from '@/mock/data';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/common/FollowButton';
import { PostCard } from '@/components/feed/PostCard';
import { QaItem } from '@/components/qa/QaItem';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { deriveUserStats } from '@/lib/stats';

/**
 * 作者主页（产品 P2）：/user/:id。
 * - u_me 重定向 /profile；unknown 空态
 * - 统计派生 + FollowButton + TA 的动态 / 问答
 */
export function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const posts = useAppStore((s) => s.posts);
  const questions = useAppStore((s) => s.questions);

  if (id === 'u_me') {
    return <Navigate to="/profile" replace />;
  }

  const user = id ? userMap[id] : undefined;
  if (!user) {
    return (
      <EmptyState
        title="用户不存在"
        action={
          <button
            onClick={() => navigate(-1)}
            className="rounded-button bg-brand px-4 py-2 text-sm text-white"
          >
            返回
          </button>
        }
      />
    );
  }

  const derived = deriveUserStats(user, posts, questions);
  const userPosts = posts.filter((p) => p.authorId === user.id);
  const userQuestions = questions.filter((q) => q.authorId === user.id);

  const stats = [
    { label: '动态', value: derived.posts },
    { label: '粉丝', value: derived.fans },
    { label: '关注', value: derived.following },
    { label: '回答', value: derived.answers },
  ];

  return (
    <div className="min-h-full bg-surface">
      {/* 顶部返回栏 */}
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-surface px-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-text-secondary"
          aria-label="返回"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <span className="text-base font-semibold text-text">作者主页</span>
      </header>

      {/* 作者头部 */}
      <header className="bg-surface px-4 pb-4 pt-6">
        <div className="flex items-center gap-4">
          <Avatar emoji={user.avatarEmoji} size={64} />
          <div className="min-w-0 flex-1">
            <span className="text-xl font-bold text-text">{user.name}</span>
            <div className="mt-1 text-xs text-text-secondary">
              {user.city} · 养宠 {user.petYears} 年
            </div>
          </div>
          <FollowButton userId={user.id} size="sm" />
        </div>

        {/* 统计 4 等分 */}
        <div className="mt-4 grid grid-cols-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-base font-semibold text-text">{s.value}</div>
              <div className="mt-0.5 text-xs text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* TA 的动态 */}
      <section className="mt-4">
        <h2 className="mb-2 px-4 text-sm font-semibold text-text">TA 的动态</h2>
        {userPosts.length === 0 ? (
          <EmptyState title="TA 还没有动态" />
        ) : (
          <div className="pb-4">
            {userPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>

      {/* TA 的问答 */}
      <section className="mb-8 mt-4">
        <h2 className="mb-2 px-4 text-sm font-semibold text-text">TA 的问答</h2>
        {userQuestions.length === 0 ? (
          <div className="px-4 text-sm text-text-tertiary">TA 还没有提问</div>
        ) : (
          <div className="pb-4">
            {userQuestions.map((q) => (
              <QaItem key={q.id} question={q} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
