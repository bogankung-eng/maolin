import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getStoredTheme, resolveTheme, applyTheme, persistTheme } from '@/lib/theme';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => {
  resetStore();
  localStorage.clear();
});

describe('深色模式 theme.ts（E1）', () => {
  it('getStoredTheme 读取合法三态', () => {
    localStorage.setItem('maolin-theme', 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('getStoredTheme 非法值回退 system', () => {
    localStorage.setItem('maolin-theme', 'weird');
    expect(getStoredTheme()).toBe('system');
  });

  it('resolveTheme 三态解析（system 无 matchMedia 命中回退 light）', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('system')).toBe('light');
  });

  it('applyTheme 写入 <html data-theme>', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    applyTheme('system');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('persistTheme 写入独立 key（不进 persist 主键）', () => {
    persistTheme('dark');
    expect(localStorage.getItem('maolin-theme')).toBe('dark');
    expect(localStorage.getItem('maolin-store-v1')).toBeNull();
  });
});

describe('TopBar 主题切换（E1）', () => {
  it('三态循环 light → dark → system → light', () => {
    useAppStore.setState({ theme: 'light' });
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>,
    );
    const btn = screen.getByRole('button', { name: '切换主题' });
    fireEvent.click(btn); // light → dark
    expect(useAppStore.getState().theme).toBe('dark');
    fireEvent.click(btn); // dark → system
    expect(useAppStore.getState().theme).toBe('system');
    fireEvent.click(btn); // system → light
    expect(useAppStore.getState().theme).toBe('light');
  });
});
