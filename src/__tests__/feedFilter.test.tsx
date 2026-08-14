import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeedPage } from '@/pages/FeedPage';
import { QaPage } from '@/pages/QaPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('Feed 过滤（Tab / 分类 / 搜索）', () => {
  it('activeTab=following 按关注表显示关注作者的帖子（P0-2 新语义）', () => {
    useAppStore.setState({ activeTab: 'following', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    // 种子预置关注 u_lin / u_zhou：post_1(u_lin)、post_3(u_zhou)、post_4(u_lin) 均应出现
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.getByText(/训练狗狗定点排便/)).toBeInTheDocument();
    expect(screen.getByText(/新入手的猫爬架测评/)).toBeInTheDocument();
    // 未关注 u_chen：post_2 不应出现
    expect(screen.queryByText(/自制兔粮分享/)).not.toBeInTheDocument();
  });

  it('关注流为空时显示提示条 + 推荐流兜底（不白屏）', () => {
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
    // 推荐兜底流应出现（post_1 为 recommend 源）
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
  });

  it('activeTab=local 渲染同城 LocalView（4 分区 + 种子条目）', () => {
    useAppStore.setState({ activeTab: 'local', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    // local Tab 不再渲染帖子流，而是 LocalView 的 4 分区
    expect(screen.getByText('宠物医院')).toBeInTheDocument();
    expect(screen.getByText('约玩')).toBeInTheDocument();
    expect(screen.getByText('宠物店')).toBeInTheDocument();
    expect(screen.getByText('找宠友')).toBeInTheDocument();
    expect(screen.getByText('安心宠物医院')).toBeInTheDocument();
    expect(screen.queryByText(/柯基宝宝打完疫苗后有点蔫/)).not.toBeInTheDocument();
  });

  it('activeCategory=health 在 recommend 下仅显示健康类帖子', () => {
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'health' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    // recommend 下 health: post_1、post_6
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.getByText(/豆豆今天满三岁/)).toBeInTheDocument();
    // diet: post_2 不应出现
    expect(screen.queryByText(/自制兔粮分享/)).not.toBeInTheDocument();
  });
});

describe('QA 过滤（分类 / 关键词）', () => {
  it('qaCategory=diet 仅显示饮食类问题', () => {
    useAppStore.setState({ qaCategory: 'diet', qaKeyword: '' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('幼猫一天喂几次比较合适？')).toBeInTheDocument();
    expect(screen.queryByText('狗狗打完疫苗后食欲不振怎么办？')).not.toBeInTheDocument();
  });

  it('qaKeyword 按标题/内容包含匹配', () => {
    useAppStore.setState({ qaCategory: 'all', qaKeyword: '疫苗' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>,
    );
    // q1 标题含「疫苗」
    expect(screen.getByText('狗狗打完疫苗后食欲不振怎么办？')).toBeInTheDocument();
    // q4(饮水机) 不含疫苗
    expect(screen.queryByText('有没有好用的自动饮水机推荐？')).not.toBeInTheDocument();
  });
});
