import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { FeedPage } from '@/pages/FeedPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('组件冒烟', () => {
  it('BottomNav 渲染五个入口与发布按钮（不崩溃）', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <BottomNav />
      </MemoryRouter>,
    );
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('问答')).toBeInTheDocument();
    expect(screen.getByText('同城')).toBeInTheDocument();
    expect(screen.getByText('我的')).toBeInTheDocument();
    expect(screen.getByLabelText('发布')).toBeInTheDocument();
  });

  it('FeedPage 默认渲染推荐流且不崩溃', () => {
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    // 顶栏 Logo
    expect(screen.getByText('毛邻')).toBeInTheDocument();
    // 至少出现一条种子帖子
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
  });
});
