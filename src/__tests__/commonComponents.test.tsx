import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Icon } from '@/components/common/Icon';
import { Toast } from '@/components/common/Toast';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('Button 按钮', () => {
  it('默认 primary 样式', () => {
    render(<Button>确定</Button>);
    const btn = screen.getByRole('button', { name: '确定' });
    expect(btn.className).toContain('bg-brand');
    expect(btn.className).toContain('text-white');
  });

  it('secondary / ghost 变体样式', () => {
    const { rerender } = render(<Button variant="secondary">次</Button>);
    expect(screen.getByRole('button').className).toContain('bg-brand-light');
    rerender(<Button variant="ghost">幽灵</Button>);
    expect(screen.getByRole('button').className).toContain('bg-transparent');
  });

  it('点击触发 onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>点我</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 透传', () => {
    render(<Button disabled>禁用</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Badge 徽章', () => {
  it('渲染文本与默认 neutral 色调', () => {
    render(<Badge>已解决</Badge>);
    const el = screen.getByText('已解决');
    expect(el).toBeInTheDocument();
  });

  it('tone 映射正确（resolved 背景）', () => {
    render(<Badge tone="resolved">已解决</Badge>);
    expect(screen.getByText('已解决').style.background).toContain('var(--color-resolved-bg)');
  });
});

describe('Avatar 头像', () => {
  it('无 src 渲染 emoji', () => {
    render(<Avatar emoji="🦊" />);
    expect(screen.getByText('🦊')).toBeInTheDocument();
  });

  it('有 src 渲染图片', () => {
    render(<Avatar emoji="🦊" src="https://x/a.png" />);
    // img 无 alt 无 role，检查 DOM img 标签
    expect(document.querySelector('img')).not.toBeNull();
    expect(screen.queryByText('🦊')).not.toBeInTheDocument();
  });

  it('自定义 size 生效', () => {
    render(<Avatar emoji="🐱" size={64} />);
    const box = screen.getByText('🐱').parentElement!;
    expect(box.style.width).toBe('64px');
    expect(box.style.height).toBe('64px');
  });
});

describe('Icon 图标', () => {
  it('渲染指定图标 emoji', () => {
    render(<Icon name="heartFill" />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });
});

describe('BottomSheet 底部弹层', () => {
  it('open=false 不渲染', () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="标题">
        <div>内容</div>
      </BottomSheet>,
    );
    expect(screen.queryByText('标题')).not.toBeInTheDocument();
  });

  it('open=true 渲染标题与内容', () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="发布动态">
        <div>内容区</div>
      </BottomSheet>,
    );
    expect(screen.getByText('发布动态')).toBeInTheDocument();
    expect(screen.getByText('内容区')).toBeInTheDocument();
  });

  it('点遮罩触发 onClose（延迟后）', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <div>内容</div>
      </BottomSheet>,
    );
    // 遮罩 aria-hidden
    const overlay = document.querySelector('.bg-black\\/50') as HTMLElement;
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay);
    act(() => vi.advanceTimersByTime(300));
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('无标题时不渲染标题节点', () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>内容</div>
      </BottomSheet>,
    );
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
});

describe('Toast 轻提示', () => {
  it('visible=false 不渲染', () => {
    render(<Toast />);
    expect(document.body.textContent).not.toContain('提示内容');
  });

  it('visible=true 渲染消息', () => {
    useAppStore.setState({ toast: { message: '发布成功', visible: true } });
    render(<Toast />);
    expect(screen.getByText('发布成功')).toBeInTheDocument();
  });
});
