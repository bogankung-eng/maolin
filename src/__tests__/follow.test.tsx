import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FollowButton } from '@/components/common/FollowButton';
import { FeedPage } from '@/pages/FeedPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('关注关系（P0-2）', () => {
  it('toggleFollow：关注增删 followingIds', () => {
    expect(useAppStore.getState().currentUser.followingIds).toEqual(['u_lin', 'u_zhou']);
    useAppStore.getState().toggleFollow('u_chen');
    expect(useAppStore.getState().currentUser.followingIds).toEqual([
      'u_lin',
      'u_zhou',
      'u_chen',
    ]);
    useAppStore.getState().toggleFollow('u_chen');
    expect(useAppStore.getState().currentUser.followingIds).toEqual(['u_lin', 'u_zhou']);
  });

  it('FollowButton 未关注：显示「＋ 关注」，点击变「已关注」并写入 followingIds', () => {
    render(
      <MemoryRouter>
        <FollowButton userId="u_chen" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '＋ 关注' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '＋ 关注' }));
    expect(screen.getByRole('button', { name: '已关注' })).toBeInTheDocument();
    expect(useAppStore.getState().currentUser.followingIds).toContain('u_chen');
  });

  it('FollowButton 已关注：显示「已关注」，点击取消关注', () => {
    render(
      <MemoryRouter>
        <FollowButton userId="u_lin" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '已关注' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '已关注' }));
    expect(screen.getByRole('button', { name: '＋ 关注' })).toBeInTheDocument();
    expect(useAppStore.getState().currentUser.followingIds).not.toContain('u_lin');
  });

  it('作者为自己时不渲染 FollowButton', () => {
    render(
      <MemoryRouter>
        <FollowButton userId="u_me" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('PostCard 头部关注按钮 stopPropagation：点击不触发卡片跳转', () => {
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'all' });
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <Routes>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/post/:id" element={<div>POST_DETAIL</div>} />
        </Routes>
      </MemoryRouter>,
    );
    // recommend 流中仅 post_2（u_chen）未关注 → 一个「＋ 关注」
    const followBtns = screen.getAllByRole('button', { name: '＋ 关注' });
    expect(followBtns.length).toBeGreaterThan(0);
    fireEvent.click(followBtns[0]);
    // 未跳转到详情页，仍停留在 FeedPage
    expect(screen.queryByText('POST_DETAIL')).not.toBeInTheDocument();
    expect(useAppStore.getState().currentUser.followingIds).toContain('u_chen');
  });

  it('following 过滤：仅显示关注作者的帖子', () => {
    useAppStore.setState({ activeTab: 'following', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    // 关注 u_lin / u_zhou
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument(); // u_lin
    expect(screen.getByText(/训练狗狗定点排便/)).toBeInTheDocument(); // u_zhou
    // 未关注 u_chen → post_2 不出现
    expect(screen.queryByText(/自制兔粮分享/)).not.toBeInTheDocument();
  });

  it('关注流空态：提示条 + 推荐兜底（不白屏）', () => {
    useAppStore.setState({
      activeTab: 'following',
      activeCategory: 'all',
      currentUser: { ...useAppStore.getState().currentUser, followingIds: [] },
    });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('关注感兴趣的主人来这里看 TA 的动态')).toBeInTheDocument();
    // 推荐兜底流出现
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
  });
});
