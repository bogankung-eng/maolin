import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());
afterEach(() => vi.useRealTimers());

describe('Toast 自动隐藏（2.2s）', () => {
  it('showToast 后 2.2s 自动隐藏', () => {
    vi.useFakeTimers();
    useAppStore.getState().showToast('测试提示');
    expect(useAppStore.getState().toast.visible).toBe(true);
    act(() => vi.advanceTimersByTime(2200));
    expect(useAppStore.getState().toast.visible).toBe(false);
  });

  it('连续 showToast 重置 timer（不提前隐藏）', () => {
    vi.useFakeTimers();
    useAppStore.getState().showToast('第一条');
    act(() => vi.advanceTimersByTime(1200));
    useAppStore.getState().showToast('第二条');
    // 距第二条 1500ms（< 2200ms），第一条的 timer 已被重置 → 仍显示
    act(() => vi.advanceTimersByTime(1500));
    expect(useAppStore.getState().toast.visible).toBe(true);
    // 距第二条满 2200ms → 隐藏
    act(() => vi.advanceTimersByTime(700));
    expect(useAppStore.getState().toast.visible).toBe(false);
  });
});
