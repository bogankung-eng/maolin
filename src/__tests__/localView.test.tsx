import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalView } from '@/components/local/LocalView';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('LocalView 同城分区', () => {
  it('默认杭州渲染 4 分区标题 + 种子条目', () => {
    render(<LocalView />);
    expect(screen.getByText('宠物医院')).toBeInTheDocument();
    expect(screen.getByText('约玩')).toBeInTheDocument();
    expect(screen.getByText('宠物店')).toBeInTheDocument();
    expect(screen.getByText('找宠友')).toBeInTheDocument();
    expect(screen.getByText('安心宠物医院')).toBeInTheDocument();
    expect(screen.getByText('西湖遛狗团')).toBeInTheDocument();
  });

  it('切换城市过滤：上海仅显示上海条目', () => {
    render(<LocalView />);
    fireEvent.click(screen.getByRole('button', { name: '上海' }));
    expect(screen.getByText('仁心动物医院')).toBeInTheDocument();
    expect(screen.queryByText('安心宠物医院')).not.toBeInTheDocument();
  });

  it('无数据城市显示各分区空态', () => {
    render(<LocalView />);
    fireEvent.click(screen.getByRole('button', { name: '深圳' }));
    expect(screen.getByText('该城市暂无宠物医院信息')).toBeInTheDocument();
    expect(screen.getByText('该城市暂无约玩信息')).toBeInTheDocument();
    expect(screen.getByText('该城市暂无宠物店信息')).toBeInTheDocument();
    expect(screen.getByText('该城市暂无找宠友信息')).toBeInTheDocument();
  });

  it('source=local 的种子帖并入对应分区（按作者城市）', () => {
    render(<LocalView />);
    // post_5 医院推荐（作者 u_chen 广州）→ 广州 · 宠物医院
    fireEvent.click(screen.getByRole('button', { name: '广州' }));
    expect(screen.getAllByText(/同城宠物医院推荐/).length).toBeGreaterThan(0);
    // post_7 猫友聚会（作者 u_lin 上海）→ 上海 · 约玩
    fireEvent.click(screen.getByRole('button', { name: '上海' }));
    expect(screen.getAllByText(/同城猫友线下聚会/).length).toBeGreaterThan(0);
  });
});
