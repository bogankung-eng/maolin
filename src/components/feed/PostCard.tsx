import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/common/FollowButton';
import { Icon } from '@/components/common/Icon';
import { getUserById } from '@/mock/data';
import { isRealImage } from '@/lib/image';
import type { Post } from '@/types';

/** 全通栏帖子卡片（语义化 article + Link 可聚焦，F2/F3/F4/E3/F8） */
export function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate();
  const toggleLike = useAppStore((s) => s.toggleLike);
  const openShare = useAppStore((s) => s.openShare);
  const pets = useAppStore((s) => s.pets);
  const author = getUserById(post.authorId);
  const pet = pets.find((p) => p.id === post.petId);
  const [bounce, setBounce] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
    setBounce(true);
    window.setTimeout(() => setBounce(false), 200);
  };

  const image = post.images[0];
  const isReal = image ? isRealImage(image) : false;
  const fallbackEmoji = pet ? pet.emoji : '🐾';

  return (
    <article className="border-b border-border bg-surface">
      {/* 头部：左（头像+昵称+宠物标签+品种徽章）右（关注按钮） */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link to={`/post/${post.id}`} className="flex min-w-0 items-center gap-2">
            <Avatar emoji={author.avatarEmoji} size={38} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-text">{author.name}</span>
              {post.petTag && (
                <span className="truncate text-xs text-text-secondary">{post.petTag}</span>
              )}
            </div>
          </Link>
          {pet && (
            <span className="shrink-0 rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand">
              {pet.breedTag}
            </span>
          )}
        </div>
        <FollowButton userId={post.authorId} size="sm" />
      </div>

      {/* 图片区（高 200，emoji / 真实图片 / 无图回退），首图 + 共N张角标 */}
      <Link
        to={`/post/${post.id}`}
        className="relative mt-3 flex h-[200px] w-full items-center justify-center overflow-hidden bg-bg"
      >
        {image ? (
          isReal ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl">{image}</span>
          )
        ) : (
          <span className="text-7xl">{fallbackEmoji}</span>
        )}
        {post.images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-button bg-black/50 px-2 py-0.5 text-xs text-white">
            共{post.images.length}张
          </span>
        )}
      </Link>

      {/* 正文 */}
      <Link
        to={`/post/${post.id}`}
        className="mt-3 block whitespace-pre-wrap px-4 text-sm leading-relaxed text-text"
      >
        {post.content}
      </Link>

      {/* 标签 → 话题页 */}
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 px-4">
          {post.tags.map((t) => (
            <Link
              key={t}
              to={`/topic/${encodeURIComponent(t)}`}
              className="rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand"
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {/* 操作栏：点赞 / 评论 / 分享（按钮化） */}
      <div className="mt-2 flex items-center gap-6 border-t border-border px-4 py-2 text-text-secondary">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm ${post.liked ? 'text-error' : ''}`}
        >
          <Icon
            name={post.liked ? 'heartFill' : 'heartOutline'}
            size={18}
            className={bounce ? 'animate-like' : ''}
          />
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className="flex items-center gap-1 text-sm"
        >
          <Icon name="comment" size={18} />
          <span>{post.comments}</span>
        </button>
        <button onClick={() => openShare(post.id)} className="flex items-center gap-1 text-sm">
          <Icon name="share" size={18} />
          <span>{post.shares}</span>
        </button>
      </div>
    </article>
  );
}
