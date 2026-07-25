import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { getUserById } from '@/mock/data';
import { Icons } from '@/lib/icons';

/** 帖子详情：大图 + 正文 + 操作栏 + 评论占位 */
export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = useAppStore((s) => s.posts.find((p) => p.id === id));
  const toggleLike = useAppStore((s) => s.toggleLike);
  const [bounce, setBounce] = useState(false);
  const [comment, setComment] = useState('');

  if (!post) {
    return (
      <div className="p-6 text-center text-text-tertiary">
        帖子不存在
        <div className="mt-4">
          <button onClick={() => navigate(-1)} className="text-brand">
            返回
          </button>
        </div>
      </div>
    );
  }

  const author = getUserById(post.authorId);
  const image = post.images[0];
  const isUrl = !!image && image.startsWith('http');

  const handleLike = () => {
    toggleLike(post.id);
    setBounce(true);
    window.setTimeout(() => setBounce(false), 200);
  };

  return (
    <div className="min-h-full bg-surface">
      {/* 顶部返回栏 */}
      <header className="sticky top-0 z-10 bg-surface border-b border-border flex items-center h-[52px] px-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary mr-3">
          ←
        </button>
        <span className="text-base font-semibold text-text">帖子详情</span>
      </header>

      {/* 作者 */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <Avatar emoji={author.avatarEmoji} size={40} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text">{author.name}</span>
          {post.petTag && (
            <span className="text-xs text-text-secondary">{post.petTag}</span>
          )}
        </div>
      </div>

      {/* 大图 */}
      {image && (
        <div className="mt-3 w-full bg-bg flex items-center justify-center overflow-hidden" style={{ minHeight: 220 }}>
          {isUrl ? (
            <img src={image} alt="" className="w-full object-cover" />
          ) : (
            <span className="text-8xl py-10">{image}</span>
          )}
        </div>
      )}

      {/* 正文 */}
      <p className="px-4 mt-4 text-sm text-text leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 mt-3">
          {post.tags.map((t) => (
            <span key={t} className="text-xs text-brand bg-brand-light rounded-pill px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 操作栏 */}
      <div className="flex items-center gap-6 px-4 py-3 mt-3 border-t border-border text-text-secondary">
        <button onClick={handleLike} className="flex items-center gap-1 text-sm">
          <span className={bounce ? 'animate-like' : ''}>
            {post.liked ? Icons.heartFill : Icons.heartOutline}
          </span>
          <span>{post.likes}</span>
        </button>
        <span className="flex items-center gap-1 text-sm">
          <span>{Icons.comment}</span>
          <span>{post.comments}</span>
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span>{Icons.share}</span>
          <span>{post.shares}</span>
        </span>
      </div>

      {/* 评论区（占位） */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-sm font-semibold text-text mb-3">评论 {post.comments}</h3>
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="说点什么…"
            className="flex-1 bg-bg border border-border rounded-button px-3 py-2 text-sm text-text outline-none focus:border-brand transition-bg"
          />
          <button className="bg-brand text-white rounded-button px-4 text-sm">发送</button>
        </div>
        <div className="mt-4 text-sm text-text-tertiary">
          {post.comments > 0 ? '精彩评论加载中…' : '还没有评论，快来抢沙发～'}
        </div>
      </section>
    </div>
  );
}
