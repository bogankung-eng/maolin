import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/common/FollowButton';
import { getUserById } from '@/mock/data';
import { Icons } from '@/lib/icons';
import type { Post } from '@/types';

/** 全通栏帖子卡片 */
export function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate();
  const toggleLike = useAppStore((s) => s.toggleLike);
  const author = getUserById(post.authorId);
  const [bounce, setBounce] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
    setBounce(true);
    window.setTimeout(() => setBounce(false), 200);
  };

  const image = post.images[0];
  const isUrl = !!image && image.startsWith('http');

  return (
    <div
      className="cursor-pointer border-b border-border bg-surface"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      {/* 头部：左（头像+昵称+宠物标签）右（关注按钮） */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar emoji={author.avatarEmoji} size={38} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-text">{author.name}</span>
            {post.petTag && (
              <span className="truncate text-xs text-text-secondary">{post.petTag}</span>
            )}
          </div>
        </div>
        <FollowButton userId={post.authorId} size="sm" />
      </div>

      {/* 图片区（高 200，emoji 或 url） */}
      {image && (
        <div className="mt-3 flex h-[200px] w-full items-center justify-center overflow-hidden bg-bg">
          {isUrl ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl">{image}</span>
          )}
        </div>
      )}

      {/* 正文 */}
      <p className="mt-3 whitespace-pre-wrap px-4 text-sm leading-relaxed text-text">
        {post.content}
      </p>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 px-4">
          {post.tags.map((t) => (
            <span key={t} className="rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 操作栏：点赞 / 评论 / 分享 */}
      <div className="mt-2 flex items-center gap-6 border-t border-border px-4 py-2 text-text-secondary">
        <button onClick={handleLike} className="flex items-center gap-1 text-sm">
          <span className={bounce ? 'animate-like' : ''}>
            {post.liked ? Icons.heartFill : Icons.heartOutline}
          </span>
          <span>{post.likes}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/post/${post.id}`);
          }}
          className="flex items-center gap-1 text-sm"
        >
          <span>{Icons.comment}</span>
          <span>{post.comments}</span>
        </button>
        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-sm">
          <span>{Icons.share}</span>
          <span>{post.shares}</span>
        </button>
      </div>
    </div>
  );
}
