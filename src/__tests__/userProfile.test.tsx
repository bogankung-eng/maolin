import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderUser = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/user/${id}`]}>
      <Routes>
        <Route path="/user/:id" element={<UserProfilePage />} />
        <Route path="/profile" element={<div>PROFILE_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('作者主页 UserProfilePage（P2）', () => {
  it('渲染作者信息与派生统计', () => {
    renderUser('u_lin');
    // 作者名在头部 + 每条 TA 动态卡片各出现一次，用 getAllByText 校验存在性
    expect(screen.getAllByText('林小宠').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/上海 · 养宠 5 年/)).toBeInTheDocument();
    expect(screen.getByText('TA 的动态')).toBeInTheDocument();
    expect(screen.getByText('TA 的问答')).toBeInTheDocument();
    // 统计标签
    expect(screen.getByText('动态')).toBeInTheDocument();
    expect(screen.getByText('粉丝')).toBeInTheDocument();
    expect(screen.getByText('关注')).toBeInTheDocument();
    expect(screen.getByText('回答')).toBeInTheDocument();
    // 派生值：粉丝 230 固定；关注 0（followingIds 空）；回答 1（a4 一条）
    expect(screen.getByText('230')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    // 动态 3（u_lin 有 3 帖；其中 post_7 shares=3 也会渲染「3」，用 getAllByText 校验存在性）
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('TA 的动态渲染作者帖子', () => {
    renderUser('u_lin');
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.getByText(/新入手的猫爬架测评/)).toBeInTheDocument();
  });

  it('u_me 重定向 /profile', () => {
    renderUser('u_me');
    expect(screen.getByText('PROFILE_PAGE')).toBeInTheDocument();
  });

  it('unknown 用户显示空态 + 返回按钮', () => {
    renderUser('nobody');
    expect(screen.getByText('用户不存在')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument();
  });
});
