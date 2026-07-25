import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FeedPage } from '@/pages/FeedPage';
import { QaPage } from '@/pages/QaPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('Feed 过滤（Tab / 分类 / 搜索）', () => {
  it('activeTab=following 仅显示关注源帖子', () => {
    useAppStore.setState({ activeTab: 'following', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>
    );
    // following 源: post_3(训练狗狗)、post_4(猫爬架)
    expect(screen.getByText(/训练狗狗定点排便/)).toBeInTheDocument();
    expect(screen.getByText(/新入手的猫爬架测评/)).toBeInTheDocument();
    // recommend 源 post_1 不应出现
    expect(screen.queryByText(/柯基宝宝打完疫苗后有点蔫/)).not.toBeInTheDocument();
  });

  it('activeTab=local 仅显示同城源帖子', () => {
    useAppStore.setState({ activeTab: 'local', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/同城宠物医院推荐/)).toBeInTheDocument();
    expect(screen.getByText(/同城猫友线下聚会报名/)).toBeInTheDocument();
    expect(screen.queryByText(/柯基宝宝打完疫苗后有点蔫/)).not.toBeInTheDocument();
  });

  it('activeCategory=health 在 recommend 下仅显示健康类帖子', () => {
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'health' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>
    );
    // recommend 下 health: post_1、post_6
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.getByText(/豆豆今天满三岁/)).toBeInTheDocument();
    // diet: post_2 不应出现
    expect(screen.queryByText(/自制兔粮分享/)).not.toBeInTheDocument();
  });

  it('搜索关键词（Feed 内联）按内容过滤', async () => {
    const user = userEvent.setup();
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText('搜索'));
    const input = screen.getByPlaceholderText('搜索当前列表内容');
    await user.type(input, '疫苗');

    // 含「疫苗」的 post_1 保留
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    // 不含「疫苗」的 post_2 被过滤
    expect(screen.queryByText(/自制兔粮分享/)).not.toBeInTheDocument();
  });
});

describe('QA 过滤（分类 / 关键词）', () => {
  it('qaCategory=diet 仅显示饮食类问题', () => {
    useAppStore.setState({ qaCategory: 'diet', qaKeyword: '' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>
    );
    expect(screen.getByText('幼猫一天喂几次比较合适？')).toBeInTheDocument();
    expect(screen.queryByText('狗狗打完疫苗后食欲不振怎么办？')).not.toBeInTheDocument();
  });

  it('qaKeyword 按标题/内容包含匹配', () => {
    useAppStore.setState({ qaCategory: 'all', qaKeyword: '疫苗' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>
    );
    // q1 标题含「疫苗」
    expect(screen.getByText('狗狗打完疫苗后食欲不振怎么办？')).toBeInTheDocument();
    // q4(饮水机) 不含疫苗
    expect(screen.queryByText('有没有好用的自动饮水机推荐？')).not.toBeInTheDocument();
  });
});
