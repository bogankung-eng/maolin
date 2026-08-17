import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '@/components/common/Avatar';
import { userMap, currentUser } from '@/mock/data';
import { formatRelativeTime } from '@/lib/time';
import type { Comment } from '@/types';

/**
 * 单条评论：头像 / 昵称 / 内容 / 相对时间。
 * 顶层评论右下有「回复」入口 → 内联回复框（发送走 addComment(postId, text, parentId)）。
 * 子回复（parentId 有值）不显示「回复」按钮（不嵌套二级及以上）。
 */
export function CommentItem({ comment }: { comment: Comment }) {
  const author = userMap[comment.authorId] ?? currentUser;
  const addComment = useAppStore((s) => s.addComment);
  const showToast = useAppStore((s) => s.showToast);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isTopLevel = !comment.parentId;

  const submitReply = () => {
    const text = replyText.trim();
    if (!text) {
      showToast('请输入评论内容');
      return;
    }
    addComment(comment.postId, text, comment.id);
    setReplyText('');
    setReplying(false);
    showToast('回复已发布');
  };

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex gap-2">
        <Avatar emoji={author.avatarEmoji} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <Link to={`/user/${comment.authorId}`} className="truncate text-[13px] font-medium text-text">
              {author.name}
            </Link>
            <span className="shrink-0 text-[11px] text-text-tertiary">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
            {comment.content}
          </p>
          {isTopLevel && (
            <div className="mt-1 flex justify-end">
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-xs text-brand"
                aria-label="回复"
              >
                回复
              </button>
            </div>
          )}
          {isTopLevel && replying && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="回复 TA…"
                className="transition-bg flex-1 rounded-button border border-border bg-bg px-3 py-1.5 text-sm text-text outline-none focus:border-brand"
              />
              <button
                onClick={submitReply}
                className="rounded-button bg-brand px-3 text-sm text-white"
              >
                发送
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
