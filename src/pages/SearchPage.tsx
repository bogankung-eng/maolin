import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { PostCard } from '@/components/feed/PostCard';
import { QaItem } from '@/components/qa/QaItem';
import { PetCard } from '@/components/profile/PetCard';
import { FollowButton } from '@/components/common/FollowButton';
import { Avatar } from '@/components/common/Avatar';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { users } from '@/mock/data';
import type { SearchTab, User } from '@/types';

const TABS: { key: SearchTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'post', label: '帖子' },
  { key: 'question', label: '问答' },
  { key: 'user', label: '用户' },
  { key: 'pet', label: '宠物' },
];

/** 全局搜索页（F1）：聚合搜 帖子/问答/用户/宠物 + 分类 Tab + 空态 */
export function SearchPage() {
  const navigate = useNavigate();
  const posts = useAppStore((s) => s.posts);
  const questions = useAppStore((s) => s.questions);
  const pets = useAppStore((s) => s.pets);
  const openPublish = useAppStore((s) => s.openPublish);
  const showToast = useAppStore((s) => s.showToast);
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<SearchTab>('all');

  const k = keyword.trim().toLowerCase();

  const matchedPosts = useMemo(() => {
    if (!k) return [];
    return posts.filter((p) =>
      [p.content, p.petTag, ...p.tags].some((s) => s.toLowerCase().includes(k)),
    );
  }, [posts, k]);

  const matchedQuestions = useMemo(() => {
    if (!k) return [];
    return questions.filter(
      (q) => q.title.toLowerCase().includes(k) || q.content.toLowerCase().includes(k),
    );
  }, [questions, k]);

  const matchedUsers = useMemo(() => {
    if (!k) return [];
    return users.filter((u) => u.name.toLowerCase().includes(k) || u.city.toLowerCase().includes(k));
  }, [k]);

  const matchedPets = useMemo(() => {
    if (!k) return [];
    return pets.filter((p) =>
      [p.name, p.species, p.breedTag].some((s) => s.toLowerCase().includes(k)),
    );
  }, [pets, k]);

  const total = matchedPosts.length + matchedQuestions.length + matchedUsers.length + matchedPets.length;

  return (
    <div className="min-h-full bg-bg">
      {/* 顶部返回 + 搜索输入 */}
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-bg px-4 py-2">
        <button onClick={() => navigate(-1)} className="text-text-secondary" aria-label="返回">
          <Icon name="chevronLeft" size={20} />
        </button>
        <input
          autoFocus
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索帖子 / 问答 / 用户 / 宠物"
          className="transition-bg flex-1 rounded-button border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
        />
      </header>

      {/* 分类 Tab */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`transition-bg whitespace-nowrap rounded-pill border px-3 py-1.5 text-sm ${
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {!k ? (
        <div className="py-16 text-center text-sm text-text-tertiary">输入关键词开始搜索</div>
      ) : total === 0 ? (
        <EmptyState
          title="没有找到相关内容"
          description="试试其他关键词"
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
        <div key={tab} className="animate-fade">
          {(tab === 'all' || tab === 'post') && matchedPosts.length > 0 && (
            <Section title="帖子">
              {matchedPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </Section>
          )}
          {(tab === 'all' || tab === 'question') && matchedQuestions.length > 0 && (
            <Section title="问答">
              {matchedQuestions.map((q) => (
                <QaItem key={q.id} question={q} />
              ))}
            </Section>
          )}
          {(tab === 'all' || tab === 'user') && matchedUsers.length > 0 && (
            <Section title="用户">
              {matchedUsers.map((u) => (
                <UserRow key={u.id} user={u} onOpen={() => showToast('个人主页开发中')} />
              ))}
            </Section>
          )}
          {(tab === 'all' || tab === 'pet') && matchedPets.length > 0 && (
            <Section title="宠物">
              {matchedPets.map((p) => (
                <PetCard key={p.id} pet={p} onClick={() => navigate(`/pet/${p.id}`)} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-2">
      <h2 className="px-4 py-2 text-xs font-semibold text-text-secondary">{title}</h2>
      {children}
    </section>
  );
}

/** 用户结果行（内联于 SearchPage，避免组件碎片化） */
function UserRow({ user, onOpen }: { user: User; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Avatar emoji={user.avatarEmoji} size={40} />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-text">{user.name}</div>
          <div className="mt-0.5 text-xs text-text-secondary">{user.city}</div>
        </div>
      </button>
      <FollowButton userId={user.id} size="sm" />
    </div>
  );
}
