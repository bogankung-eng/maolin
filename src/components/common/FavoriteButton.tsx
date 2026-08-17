import { useAppStore } from '@/store/useAppStore';
import { selectIsFavorite } from '@/store/selectors';
import { Icon } from '@/components/common/Icon';
import type { FavoriteType } from '@/types';

/**
 * 收藏按钮（产品 P1）：Bookmark 描边 ↔ 填充，四处同源。
 * 点击 stopPropagation 防触发卡片跳转；aria-label 区分「收藏/取消收藏」。
 */
export function FavoriteButton({
  type,
  id,
  size = 'md',
}: {
  type: FavoriteType;
  id: string;
  size?: 'sm' | 'md';
}) {
  const isFavorite = useAppStore(selectIsFavorite(type, id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const label = isFavorite ? '取消收藏' : '收藏';
  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(type, id);
      }}
      aria-label={label}
      className={`flex shrink-0 items-center justify-center ${
        isFavorite ? 'text-brand' : 'text-text-secondary'
      }`}
    >
      <Icon
        name="bookmark"
        size={iconSize}
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  );
}
