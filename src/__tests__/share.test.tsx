import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShareSheet } from '@/components/common/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('ShareSheet 分享弹层', () => {
  it('store：openShare / incrementShare / closeShare 状态流转', () => {
    const before = useAppStore.getState().posts.find((p) => p.id === 'post_1')!.shares;
    useAppStore.getState().openShare('post_1');
    expect(useAppStore.getState().shareOverlay).toEqual({ open: true, postId: 'post_1' });

    useAppStore.getState().incrementShare('post_1');
    expect(useAppStore.getState().posts.find((p) => p.id === 'post_1')!.shares).toBe(before + 1);

    useAppStore.getState().closeShare();
    expect(useAppStore.getState().shareOverlay.open).toBe(false);
  });

  it('复制链接 → shares+1 + toast「链接已复制」并关闭', async () => {
    useAppStore.setState({ shareOverlay: { open: true, postId: 'post_1' } });
    render(<ShareSheet />);
    expect(screen.getByText('分享')).toBeInTheDocument();

    const before = useAppStore.getState().posts.find((p) => p.id === 'post_1')!.shares;
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制链接' }));
    });

    expect(useAppStore.getState().posts.find((p) => p.id === 'post_1')!.shares).toBe(before + 1);
    expect(useAppStore.getState().toast.message).toBe('链接已复制');
    expect(useAppStore.getState().shareOverlay.open).toBe(false);
  });

  it('navigator.share 不可用时隐藏「系统分享」按钮', () => {
    useAppStore.setState({ shareOverlay: { open: true, postId: 'post_1' } });
    // jsdom 默认无 navigator.share
    render(<ShareSheet />);
    expect(screen.getByRole('button', { name: '复制链接' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '系统分享' })).not.toBeInTheDocument();
  });
});
