import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublishGuide } from '@/components/publish/PublishGuide';
import { PublishSheet } from '@/components/publish/PublishSheet';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => {
  resetStore();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('发帖引导 PublishGuide（P4）', () => {
  it('open=false 不渲染', () => {
    render(
      <MemoryRouter>
        <PublishGuide />
      </MemoryRouter>,
    );
    expect(screen.queryByText('发布成功！')).not.toBeInTheDocument();
  });

  it('open=true 渲染引导条并 5s 自动消失', () => {
    useAppStore.setState({ publishGuide: { open: true } });
    render(
      <MemoryRouter>
        <PublishGuide />
      </MemoryRouter>,
    );
    expect(screen.getByText('发布成功！')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看我的' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(useAppStore.getState().publishGuide.open).toBe(false);
  });

  it('手动点击关闭按钮隐藏引导', () => {
    useAppStore.setState({ publishGuide: { open: true } });
    render(
      <MemoryRouter>
        <PublishGuide />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '关闭引导' }));
    expect(useAppStore.getState().publishGuide.open).toBe(false);
  });

  it('发帖成功后触发 showPublishGuide', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    render(
      <MemoryRouter>
        <PublishSheet />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByPlaceholderText(/分享你和毛孩子的故事/), {
      target: { value: '测试发帖内容' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发布' }));
    expect(useAppStore.getState().publishGuide.open).toBe(true);
  });
});
