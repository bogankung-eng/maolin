import type { AppState } from '@/store/useAppStore';
import type { FavoriteType } from '@/types';

/**
 * store 逻辑切片：具名 selector（工程 E2）。
 * 组件按需订阅，禁止整 store 订阅；集合字段优先用这些 selector。
 */

/** 收藏列表 */
export const selectFavorites = (s: AppState) => s.favorites;

/** 是否已收藏某类型某 id（工厂 selector，供 useAppStore 订阅） */
export const selectIsFavorite =
  (type: FavoriteType, id: string) =>
  (s: AppState): boolean =>
    s.favorites.some((f) => f.type === type && f.id === id);

/** 当前用户关注列表 */
export const selectFollowingIds = (s: AppState) => s.currentUser.followingIds ?? [];

/** 未读通知数 */
export const selectUnreadCount = (s: AppState) => s.notifications.filter((n) => !n.read).length;

/** 主题三态 */
export const selectTheme = (s: AppState) => s.theme;
