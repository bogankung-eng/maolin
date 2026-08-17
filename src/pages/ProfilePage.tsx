import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { Icon } from '@/components/common/Icon';
import { PetCard } from '@/components/profile/PetCard';
import { PetForm } from '@/components/profile/PetForm';
import { HealthRecordList } from '@/components/profile/HealthRecordList';
import { PostCard } from '@/components/feed/PostCard';
import { QaItem } from '@/components/qa/QaItem';
import { deriveUserStats } from '@/lib/stats';
import { isRealImage } from '@/lib/image';
import type { Post, Question } from '@/types';

/** 我的：个人信息 / 统计 / 宠物 / 健康 / 动态·收藏分段 */
export function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const pets = useAppStore((s) => s.pets);
  const healthRecords = useAppStore((s) => s.healthRecords);
  const posts = useAppStore((s) => s.posts);
  const questions = useAppStore((s) => s.questions);
  const favorites = useAppStore((s) => s.favorites);
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [section, setSection] = useState<'posts' | 'favorites'>('posts');

  const myPosts = posts.filter((p) => p.authorId === currentUser.id);

  // 收藏项解析为可渲染实体（帖子/问答），缺失实体自动跳过
  const favoritePosts = favorites
    .filter((f) => f.type === 'post')
    .map((f) => posts.find((p) => p.id === f.id))
    .filter((p): p is Post => p != null);
  const favoriteQuestions = favorites
    .filter((f) => f.type === 'question')
    .map((f) => questions.find((q) => q.id === f.id))
    .filter((q): q is Question => q != null);

  // 统计真实化（F5）：动态/回答派生、关注=followingIds.length、粉丝固定 230
  const derived = deriveUserStats(currentUser, posts, questions);
  const stats = [
    { label: '帖子', value: derived.posts },
    { label: '粉丝', value: derived.fans },
    { label: '关注', value: derived.following },
    { label: '回答', value: derived.answers },
  ];

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <header className="bg-surface px-4 pb-4 pt-6">
        <div className="flex items-center gap-4">
          <Avatar emoji={currentUser.avatarEmoji} size={64} />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text">{currentUser.name}</span>
            <span className="mt-1 text-xs text-text-secondary">
              {currentUser.city} · 养宠 {currentUser.petYears} 年
            </span>
          </div>
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

      {/* 我的宠物 */}
      <section className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">我的宠物</h2>
        <div className="flex flex-col gap-2">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onClick={() => navigate(`/pet/${pet.id}`)} />
          ))}
          <button
            onClick={() => setPetFormOpen(true)}
            className="transition-bg flex items-center justify-center gap-2 rounded-pet border border-dashed border-border py-4 text-sm text-text-secondary hover:border-brand"
          >
            <Icon name="plus" size={14} />
            添加宠物
          </button>
        </div>
      </section>

      {/* 健康记录 */}
      <section className="mt-6 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">健康记录</h2>
        <HealthRecordList records={healthRecords} />
      </section>

      {/* 动态 / 收藏 分段 */}
      <section className="mb-8 mt-6 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">我的动态</h2>
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setSection('posts')}
            className={`transition-bg rounded-pill border px-3 py-1 text-xs ${
              section === 'posts'
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-surface text-text-secondary'
            }`}
          >
            动态
          </button>
          <button
            onClick={() => setSection('favorites')}
            className={`transition-bg rounded-pill border px-3 py-1 text-xs ${
              section === 'favorites'
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-surface text-text-secondary'
            }`}
          >
            收藏
          </button>
        </div>

        {section === 'posts' ? (
          myPosts.length === 0 ? (
            <div className="text-sm text-text-tertiary">还没有动态，去发布一条吧～</div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {myPosts.slice(0, 9).map((p) => {
                const img = p.images[0];
                const isReal = isRealImage(img);
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/post/${p.id}`)}
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-button bg-bg"
                  >
                    {isReal ? (
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : img ? (
                      <span className="text-3xl">{img}</span>
                    ) : (
                      <span className="line-clamp-2 px-1 text-center text-xs text-text-tertiary">
                        {p.content.slice(0, 12)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : favoritePosts.length === 0 && favoriteQuestions.length === 0 ? (
          <div className="text-sm text-text-tertiary">还没有收藏，去收藏一些内容吧～</div>
        ) : (
          <div>
            {favoritePosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
            {favoriteQuestions.map((q) => (
              <QaItem key={q.id} question={q} />
            ))}
          </div>
        )}
      </section>

      {/* 添加宠物表单弹层（替换 window.prompt） */}
      <PetForm open={petFormOpen} onClose={() => setPetFormOpen(false)} />
    </div>
  );
}
