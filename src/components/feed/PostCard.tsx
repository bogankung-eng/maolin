import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/common/FollowButton';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { Icon } from '@/components/common/Icon';
import { userMap, currentUser } from '@/mock/data';
import { isRealImage } from '@/lib/image';
import { safeVibrate } from '@/lib/vibrate';
import type { Post } from '@/types';

/** 全通栏帖子卡片：variant full（大图）/ compact（左文右图 88×88，clamp-2） */
function PostCardBase({ post, variant = 'full' }: { post: Post; variant?: 'full' | 'compact' }) {
  const navigate = useNavigate();
  const toggleLike = useAppStore((s) => s.toggleLike);
  const openShare = useAppStore((s) => s.openShare);
  const pets = useAppStore((s) => s.pets);
  const author = userMap[post.authorId] ?? currentUser;
  const pet = pets.find((p) => p.id === post.petId);
  const [bounce, setBounce] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
    safeVibrate(15);
    setBounce(true);
    window.setTimeout(() => setBounce(false), 200);
  };

  const image = post.images[0];
  const isReal = image ? isRealImage(image) : false;
  const fallbackEmoji = pet ? pet.emoji : '🐾';

  if (variant === 'compact') {
    return (
      <article className="border-b border-border bg-surface">
        <div className="flex gap-3 px-4 py-3">
          {/* 左：作者 + 正文 clamp-2 + 操作 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/user/${post.authorId}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                <Avatar emoji={author.avatarEmoji} size={20} />
                <span className="truncate text-xs font-medium text-text">{author.name}</span>
              </Link>
              <FollowButton userId={post.authorId} size="sm" />
            </div>
            <Link
              to={`/post/${post.id}`}
              className="mt-1.5 block line-clamp-2 text-sm leading-snug text-text"
            >
              {post.content}
            </Link>
            <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 ${post.liked ? 'text-error' : ''}`}
              >
                <Icon
                  name={post.liked ? 'heartFill' : 'heartOutline'}
                  size={16}
                  className={bounce ? 'animate-like' : ''}
                />
                <span>{post.likes}</span>
              </button>
              <span className="flex items-center gap-1">
                <Icon name="comment" size={16} />
                <span>{post.comments}</span>
              </span>
              <FavoriteButton type="post" id={post.id} size="sm" />
            </div>
          </div>
          {/* 右：首图 88×88 */}
          <Link
            to={`/post/${post.id}`}
            className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-button bg-bg"
          >
            {image ? (
              isReal ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl">{image}</span>
              )
            ) : (
              <span className="text-4xl">{fallbackEmoji}</span>
            )}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="border-b border-border bg-surface">
      {/* 头部：左（头像+昵称+宠物标签+品种徽章）右（关注按钮） */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link to={`/user/${post.authorId}`} className="flex min-w-0 items-center gap-2">
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

      {/* 操作栏：点赞 / 评论 / 分享 / 收藏（按钮化） */}
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
        <span className="ml-auto">
          <FavoriteButton type="post" id={post.id} />
        </span>
      </div>
    </article>
  );
}

export const PostCard = memo(PostCardBase);
