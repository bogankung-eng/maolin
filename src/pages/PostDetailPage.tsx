import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/common/FollowButton';
import { CommentList } from '@/components/comment/CommentList';
import { getUserById } from '@/mock/data';
import { Icons } from '@/lib/icons';

/**
 * 帖子详情：大图 + 正文 + 操作栏 + 作者关注 + 评论（列表/发送/楼主一级回复）。
 * 评论发布走 store.addComment → 回写 post.comments +1，Feed 卡片同步。
 */
export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = useAppStore((s) => s.posts.find((p) => p.id === id));
  const toggleLike = useAppStore((s) => s.toggleLike);
  const addComment = useAppStore((s) => s.addComment);
  const showToast = useAppStore((s) => s.showToast);
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

  const handleSend = () => {
    const text = comment.trim();
    if (!text) {
      showToast('请输入评论内容');
      return;
    }
    addComment(post.id, text);
    setComment('');
    showToast('评论已发布');
  };

  return (
    <div className="min-h-full bg-surface">
      {/* 顶部返回栏 */}
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-surface px-4">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-secondary">
          ←
        </button>
        <span className="text-base font-semibold text-text">帖子详情</span>
      </header>

      {/* 作者 + 关注按钮（同 store，与 Feed 卡片状态一致） */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar emoji={author.avatarEmoji} size={40} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">{author.name}</span>
            {post.petTag && <span className="text-xs text-text-secondary">{post.petTag}</span>}
          </div>
        </div>
        <FollowButton userId={post.authorId} size="sm" />
      </div>

      {/* 大图 */}
      {image && (
        <div
          className="mt-3 flex w-full items-center justify-center overflow-hidden bg-bg"
          style={{ minHeight: 220 }}
        >
          {isUrl ? (
            <img src={image} alt="" className="w-full object-cover" />
          ) : (
            <span className="py-10 text-8xl">{image}</span>
          )}
        </div>
      )}

      {/* 正文 */}
      <p className="mt-4 whitespace-pre-wrap px-4 text-sm leading-relaxed text-text">
        {post.content}
      </p>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 px-4">
          {post.tags.map((t) => (
            <span key={t} className="rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 操作栏 */}
      <div className="mt-3 flex items-center gap-6 border-t border-border px-4 py-3 text-text-secondary">
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

      {/* 评论区：真实列表 + 发送 + 楼主一级回复 */}
      <section className="border-t border-border py-4">
        <h3 className="mb-3 px-4 text-sm font-semibold text-text">评论 {post.comments}</h3>
        <div className="flex gap-2 px-4">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="说点什么…"
            className="transition-bg flex-1 rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
          <button onClick={handleSend} className="rounded-button bg-brand px-4 text-sm text-white">
            发送
          </button>
        </div>
        <CommentList postId={post.id} />
      </section>
    </div>
  );
}
