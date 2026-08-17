import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/common/Skeleton';
import { QaList } from '@/components/qa/QaList';
import { PageFallback } from '@/components/layout/PageFallback';

describe('骨架屏 Skeleton（P3）', () => {
  it('Skeleton 渲染 animate-shimmer + aria-hidden', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.className).toContain('animate-shimmer');
  });

  it('QaList loading=true 渲染骨架行（role=status）', () => {
    render(<QaList questions={[]} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('暂无相关问题')).not.toBeInTheDocument();
  });

  it('QaList loading=false 且空列表显示占位文案', () => {
    render(<QaList questions={[]} />);
    expect(screen.getByText('暂无相关问题')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('PageFallback 渲染吉祥物 + 骨架 + 加载中文案', () => {
    render(<PageFallback />);
    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });
});
