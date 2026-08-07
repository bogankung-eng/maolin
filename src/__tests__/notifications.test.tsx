import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NotificationPage } from '@/pages/NotificationPage';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderNotif = () =>
  render(
    <MemoryRouter initialEntries={['/notifications']}>
      <Routes>
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/post/:id" element={<div>POST_PAGE</div>} />
        <Route path="/qa/:id" element={<div>QA_PAGE</div>} />
        <Route path="/pet/:id" element={<div>PET_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('通知中心（P0-4）', () => {
  it('种子 4 类通知全部渲染（含文案）', () => {
    renderNotif();
    expect(screen.getByText('林小宠 赞了你的动态')).toBeInTheDocument();
    expect(screen.getByText('陈泡泡 评论了你的动态')).toBeInTheDocument();
    expect(screen.getByText('周兽医 回答了你的问题')).toBeInTheDocument();
    expect(screen.getByText(/咪咪的 猫三联 已过期/)).toBeInTheDocument();
  });

  it('进入通知页后全部标记已读（幂等）', () => {
    expect(useAppStore.getState().notifications.some((n) => !n.read)).toBe(true);
    renderNotif();
    expect(useAppStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it('点击被点赞/被评论通知 → 跳转帖子详情', () => {
    renderNotif();
    fireEvent.click(screen.getByText('林小宠 赞了你的动态'));
    expect(screen.getByText('POST_PAGE')).toBeInTheDocument();
  });

  it('点击问题被回答通知 → 跳转问答详情', () => {
    renderNotif();
    fireEvent.click(screen.getByText('周兽医 回答了你的问题'));
    expect(screen.getByText('QA_PAGE')).toBeInTheDocument();
  });

  it('点击健康到期通知 → 跳转宠物详情', () => {
    renderNotif();
    fireEvent.click(screen.getByText(/咪咪的 猫三联 已过期/));
    expect(screen.getByText('PET_PAGE')).toBeInTheDocument();
  });

  it('TopBar 铃铛角标显示未读数（种子未读 3 条）', () => {
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <TopBar search="" onSearchChange={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('无通知时显示空态「暂时没有新通知」', () => {
    useAppStore.setState({ notifications: [] });
    renderNotif();
    expect(screen.getByText('暂时没有新通知')).toBeInTheDocument();
  });
});
