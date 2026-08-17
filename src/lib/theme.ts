import type { ThemeMode } from '@/types';

/** 主题持久化 key（独立于 persist 主键 maolin-store-v1） */
const KEY = 'maolin-theme';

/** 读取本地存储的主题偏好；非法/不可用时回退 system */
export function getStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

/** 将三态解析为最终生效的两态；system 无 matchMedia 时回退 light */
export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    try {
      if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch {
      // 忽略 matchMedia 异常
    }
    return 'light';
  }
  return mode;
}

/** 将最终主题写到 <html data-theme>，驱动 CSS 变量覆盖（避免 FOUC） */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolveTheme(mode);
}

/** 持久化主题偏好（独立 key，不进 persist 主键） */
export function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // 忽略写入失败
  }
}
