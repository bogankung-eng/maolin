import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
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
      className="bg-surface border-b border-border cursor-pointer"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      {/* 头部：头像 + 用户名 + 宠物标签 */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <Avatar emoji={author.avatarEmoji} size={38} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text truncate">{author.name}</span>
          {post.petTag && (
            <span className="text-xs text-text-secondary truncate">{post.petTag}</span>
          )}
        </div>
      </div>

      {/* 图片区（高 200，emoji 或 url） */}
      {image && (
        <div className="mt-3 h-[200px] w-full bg-bg flex items-center justify-center overflow-hidden">
          {isUrl ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{image}</span>
          )}
        </div>
      )}

      {/* 正文 */}
      <p className="px-4 mt-3 text-sm text-text leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 mt-2">
          {post.tags.map((t) => (
            <span key={t} className="text-xs text-brand bg-brand-light rounded-pill px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 操作栏：点赞 / 评论 / 分享 */}
      <div className="flex items-center gap-6 px-4 py-2 mt-2 border-t border-border text-text-secondary">
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
