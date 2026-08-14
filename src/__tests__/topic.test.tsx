import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TopicPage } from '@/pages/TopicPage';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderTopic = (tag: string) =>
  render(
    <MemoryRouter initialEntries={[`/topic/${encodeURIComponent(tag)}`]}>
      <Routes>
        <Route path="/topic/:tag" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('TopicPage 话题聚合', () => {
  it('聚合含标签帖子 + 标题命中问答，并显示计数', () => {
    renderTopic('疫苗');
    expect(screen.getByText('话题 #疫苗')).toBeInTheDocument();
    expect(screen.getByText('1 条帖子 · 1 条问答')).toBeInTheDocument();
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.getByText('狗狗打完疫苗后食欲不振怎么办？')).toBeInTheDocument();
  });

  it('分类中文名命中问答（如「饮食」）', () => {
    renderTopic('饮食');
    // post_2 含标签「饮食」
    expect(screen.getByText(/自制兔粮分享/)).toBeInTheDocument();
    // q2 分类 diet=饮食 命中
    expect(screen.getByText('幼猫一天喂几次比较合适？')).toBeInTheDocument();
  });

  it('无内容话题显示空态 + 行动按钮', () => {
    renderTopic('不存在的标签xyz');
    expect(screen.getByText('这个话题还没有内容')).toBeInTheDocument();
    expect(screen.getByText('去发帖')).toBeInTheDocument();
    expect(screen.getByText('去提问')).toBeInTheDocument();
  });
});
