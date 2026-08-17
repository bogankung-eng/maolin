import type { PersistStorage, StorageValue } from 'zustand/middleware';

/**
 * persist 自定义 storage（工程 E7）：
 * 「首写同步 + 尾写合并」——窗口内第一次写入同步落 localStorage（保证存量测试同步读不破），
 * 后续连发写入合并为最后一次，由尾定时器统一落盘；beforeunload / visibilitychange 兜底最终一致。
 *
 * 额外提供 reset()：清空待写队列与定时器，供测试 resetStore 复位防抖窗口，避免跨用例串扰。
 */
export interface DebouncedStorage extends PersistStorage<unknown> {
  /** 复位防抖窗口（清空 pending + 定时器，不触碰 localStorage 已落盘内容） */
  reset(): void;
}

export function createDebouncedStorage(delayMs = 400): DebouncedStorage {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { name: string; value: string } | null = null;

  const base = (): Storage => localStorage;

  const flush = () => {
    if (pending) {
      try {
        base().setItem(pending.name, pending.value);
      } catch {
        // 配额满 / 隐私模式写失败：忽略，不影响内存态
      }
      pending = null;
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, delayMs);
  };

  const reset = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pending = null;
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  return {
    getItem: (name) => {
      try {
        const raw = base().getItem(name);
        return raw == null ? null : (JSON.parse(raw) as StorageValue<unknown>);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      const json = JSON.stringify(value);
      if (!timer) {
        // 首写同步：立即落盘，保证 persist.test 的同步读断言
        try {
          base().setItem(name, json);
        } catch {
          // 忽略写失败
        }
      } else {
        // 窗口内后续写合并为最后一次
        pending = { name, value: json };
      }
      schedule();
    },
    removeItem: (name) => {
      reset();
      try {
        base().removeItem(name);
      } catch {
        // 忽略
      }
    },
    reset,
  };
}
