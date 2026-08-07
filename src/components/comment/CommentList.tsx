import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CommentItem } from './CommentItem';

/**
 * 评论列表：按 postId 过滤 store.comments。
 * - 顶层（parentId 无）按 createdAt 倒序（新在前）
 * - 子回复（parentId 有）按正序缩进在父评论下（楼中楼）
 * - 空态「还没有评论，快来抢沙发～」
 */
export function CommentList({ postId }: { postId: string }) {
  const comments = useAppStore((s) => s.comments);

  const postComments = useMemo(
    () => comments.filter((c) => c.postId === postId),
    [comments, postId],
  );

  const topLevel = useMemo(
    () =>
      postComments
        .filter((c) => !c.parentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [postComments],
  );

  if (topLevel.length === 0) {
    return <div className="mt-4 text-sm text-text-tertiary">还没有评论，快来抢沙发～</div>;
  }

  return (
    <div className="mt-2">
      {topLevel.map((c) => {
        const replies = postComments
          .filter((r) => r.parentId === c.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return (
          <div key={c.id} className="animate-fade-up">
            <CommentItem comment={c} />
            {replies.map((r) => (
              <div key={r.id} className="animate-fade-up pl-8">
                <CommentItem comment={r} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
