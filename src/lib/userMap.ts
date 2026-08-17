import type { User } from '@/types';

/** 用户 id -> User 的 O(1) 索引 */
export type UserMap = Record<string, User>;

/**
 * 构建用户 Map（工程 E9）：纯函数，仅依赖入参，不 import mock/data（避免循环依赖）。
 * 消费方用 `userMap[id] ?? currentUser` 替代线性 `users.find`。
 */
export function buildUserMap(users: User[]): UserMap {
  const map: UserMap = {};
  for (const u of users) {
    map[u.id] = u;
  }
  return map;
}
