import { useAppStore } from '@/store/useAppStore';

/** persist 主键，需与 useAppStore 的 persist name 保持一致 */
const STORAGE_KEY = 'maolin-store-v1';

/** 上一次已应用的原始值（用于同值守卫，防止跨标签回写死循环） */
let lastApplied: string | null = null;

/**
 * 多标签同步（工程 E8）：
 * 监听 window 的 storage 事件，仅把 8 个持久化字段同步进内存，绝不覆盖视图态；
 * lastApplied 字符串守卫 + 只同步持久化字段，杜绝回写死循环。
 * 在 main.tsx 启动时调用一次。
 */
export function initStorageSync(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || e.newValue == null) return;
    if (e.newValue === lastApplied) return; // ① 同值守卫，防死循环
    lastApplied = e.newValue;

    try {
      const parsed = JSON.parse(e.newValue) as { state?: Record<string, unknown> };
      const state = parsed.state ?? {};
      useAppStore.setState({
        posts: state.posts as never,
        questions: state.questions as never,
        pets: state.pets as never,
        healthRecords: state.healthRecords as never,
        comments: state.comments as never,
        notifications: state.notifications as never,
        currentUser: state.currentUser as never,
        favorites: (Array.isArray(state.favorites) ? state.favorites : []) as never,
      });
    } catch {
      // ② 脏数据忽略，不影响当前会话
    }
  });
}
