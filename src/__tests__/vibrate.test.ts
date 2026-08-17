import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeVibrate } from '@/lib/vibrate';

afterEach(() => {
  // 清理注入的 vibrate，避免跨用例串扰
  delete (navigator as unknown as { vibrate?: unknown }).vibrate;
});

describe('safeVibrate（P5）', () => {
  it('navigator.vibrate 不存在时静默返回不抛错', () => {
    expect(() => safeVibrate(15)).not.toThrow();
  });

  it('navigator.vibrate 存在时透传 pattern 调用', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
      writable: true,
    });
    safeVibrate([10, 20]);
    expect(vibrate).toHaveBeenCalledWith([10, 20]);
  });

  it('vibrate 抛错被捕获不向上抛', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: () => {
        throw new Error('vibrate failed');
      },
      configurable: true,
      writable: true,
    });
    expect(() => safeVibrate(15)).not.toThrow();
  });
});
