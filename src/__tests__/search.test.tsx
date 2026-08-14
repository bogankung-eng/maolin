import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchPage } from '@/pages/SearchPage';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderSearch = () =>
  render(
    <MemoryRouter initialEntries={['/search']}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/pet/:id" element={<div>PET_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );

const type = (v: string) =>
  fireEvent.change(screen.getByPlaceholderText(/搜索帖子/), { target: { value: v } });

describe('SearchPage 全局搜索', () => {
  it('空关键词显示输入提示', () => {
    renderSearch();
    expect(screen.getByText('输入关键词开始搜索')).toBeInTheDocument();
  });

  it('关键词聚合帖子 + 问答（默认全部 Tab）', () => {
    renderSearch();
    type('疫苗');
    // 帖子 post_1 内容含「疫苗」
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    // 问答 q1 标题含「疫苗」
    expect(screen.getByText('狗狗打完疫苗后食欲不振怎么办？')).toBeInTheDocument();
  });

  it('分类 Tab 切换：帖子 Tab 只显示帖子', () => {
    renderSearch();
    type('疫苗');
    fireEvent.click(screen.getByRole('button', { name: '帖子' }));
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.queryByText('狗狗打完疫苗后食欲不振怎么办？')).not.toBeInTheDocument();
  });

  it('用户按城市匹配（忽略大小写）', () => {
    renderSearch();
    type('上海');
    fireEvent.click(screen.getByRole('button', { name: '用户' }));
    expect(screen.getByText('林小宠')).toBeInTheDocument();
  });

  it('宠物匹配 + 无结果空态', () => {
    renderSearch();
    type('柯基');
    fireEvent.click(screen.getByRole('button', { name: '宠物' }));
    expect(screen.getByText('豆豆')).toBeInTheDocument();

    // 无结果空态 + 行动按钮
    type('zzzzzz');
    expect(screen.getByText('没有找到相关内容')).toBeInTheDocument();
    expect(screen.getByText('试试其他关键词')).toBeInTheDocument();
    expect(screen.getByText('去发帖')).toBeInTheDocument();
    expect(screen.getByText('去提问')).toBeInTheDocument();
  });
});
