import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/common/FollowButton';
import { CommentList } from '@/components/comment/CommentList';
import { Icon } from '@/components/common/Icon';
import { getUserById } from '@/mock/data';
import { isRealImage } from '@/lib/image';

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
  const openShare = useAppStore((s) => s.openShare);
  const pets = useAppStore((s) => s.pets);
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
  const pet = pets.find((p) => p.id === post.petId);
  const image = post.images[0];
  const isReal = image ? isRealImage(image) : false;

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
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-text-secondary"
          aria-label="返回"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <span className="text-base font-semibold text-text">帖子详情</span>
      </header>

      {/* 作者 + 关注按钮（同 store，与 Feed 卡片状态一致） */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar emoji={author.avatarEmoji} size={40} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">{author.name}</span>
            <div className="flex items-center gap-1">
              {post.petTag && <span className="text-xs text-text-secondary">{post.petTag}</span>}
              {pet && (
                <span className="rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand">
                  {pet.breedTag}
                </span>
              )}
            </div>
          </div>
        </div>
        <FollowButton userId={post.authorId} size="sm" />
      </div>

      {/* 大图（首图 + 共N张角标） */}
      {image && (
        <div
          className="relative mt-3 flex w-full items-center justify-center overflow-hidden bg-bg"
          style={{ minHeight: 220 }}
        >
          {isReal ? (
            <img src={image} alt="" className="w-full object-cover" />
          ) : (
            <span className="py-10 text-8xl">{image}</span>
          )}
          {post.images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-button bg-black/50 px-2 py-0.5 text-xs text-white">
              共{post.images.length}张
            </span>
          )}
        </div>
      )}

      {/* 正文 */}
      <p className="mt-4 whitespace-pre-wrap px-4 text-sm leading-relaxed text-text">
        {post.content}
      </p>

      {/* 标签 → 话题页 */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 px-4">
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

      {/* 操作栏 */}
      <div className="mt-3 flex items-center gap-6 border-t border-border px-4 py-3 text-text-secondary">
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
        <span className="flex items-center gap-1 text-sm">
          <Icon name="comment" size={18} />
          <span>{post.comments}</span>
        </span>
        <button onClick={() => openShare(post.id)} className="flex items-center gap-1 text-sm">
          <Icon name="share" size={18} />
          <span>{post.shares}</span>
        </button>
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
