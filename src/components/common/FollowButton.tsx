import { useAppStore } from '@/store/useAppStore';

/**
 * 关注按钮状态机（P0-2）：
 * - 未关注：品牌绿底白字「＋ 关注」
 * - 已关注：灰底「已关注」
 * - userId === currentUser.id 时不渲染（不关注自己）
 * 点击必须 e.stopPropagation()（防触发卡片/列表跳转）；只读 store，不持有本地 state（多入口同步）。
 */
export function FollowButton({ userId, size = 'md' }: { userId: string; size?: 'sm' | 'md' }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const toggleFollow = useAppStore((s) => s.toggleFollow);

  if (userId === currentUser.id) return null;

  const isFollowing = (currentUser.followingIds ?? []).includes(userId);
  const isSm = size === 'sm';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollow(userId);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-bg flex shrink-0 items-center justify-center rounded-pill border px-3 text-xs active:scale-[0.96] ${
        isFollowing
          ? 'border-border bg-bg text-text-tertiary'
          : 'border-brand bg-brand text-white'
      } ${isSm ? 'py-1' : 'py-1.5'}`}
    >
      {isFollowing ? '已关注' : '＋ 关注'}
    </button>
  );
}
