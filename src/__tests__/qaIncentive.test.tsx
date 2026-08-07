import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QaPage } from '@/pages/QaPage';
import { QaDetailPage } from '@/pages/QaDetailPage';
import { QaStatusFilter } from '@/components/qa/QaStatusFilter';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderQa = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/qa/${id}`]}>
      <Routes>
        <Route path="/qa/:id" element={<QaDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('问答状态筛选与兽医激励（P0-5）', () => {
  it('QaStatusFilter 渲染 全部/待解答/已解决/紧急', () => {
    render(<QaStatusFilter value="all" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '全部' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '待解答' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '已解决' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '紧急' })).toBeInTheDocument();
  });

  it('待解答筛选仅显示 open（含 0 回答 q4），不显示 resolved/urgent', () => {
    useAppStore.setState({ qaCategory: 'all', qaKeyword: '' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '待解答' }));
    expect(screen.getByText('狗狗打完疫苗后食欲不振怎么办？')).toBeInTheDocument(); // q1 open
    expect(screen.getByText('有没有好用的自动饮水机推荐？')).toBeInTheDocument(); // q4 open
    expect(screen.queryByText('幼猫一天喂几次比较合适？')).not.toBeInTheDocument(); // q2 resolved
    expect(screen.queryByText('猫咪半夜跑酷怎么破？急！')).not.toBeInTheDocument(); // q3 urgent
  });

  it('已解决筛选仅显示 resolved（q2）', () => {
    useAppStore.setState({ qaCategory: 'all', qaKeyword: '' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '已解决' }));
    expect(screen.getByText('幼猫一天喂几次比较合适？')).toBeInTheDocument();
    expect(screen.queryByText('狗狗打完疫苗后食欲不振怎么办？')).not.toBeInTheDocument();
  });

  it('状态筛选与分类叠加（医疗 + 待解答 → 仅 q5）', () => {
    useAppStore.setState({ qaCategory: 'medical', qaKeyword: '' });
    render(
      <MemoryRouter>
        <QaPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '待解答' }));
    expect(screen.getByText('宠物绝育的最佳年龄是多大？')).toBeInTheDocument(); // q5 medical open
    expect(screen.queryByText('狗狗打完疫苗后食欲不振怎么办？')).not.toBeInTheDocument(); // q1 health
  });

  it('兽医采纳回答显示激励徽章「+50 分 · 最佳答主」', () => {
    // q2 种子：a2（周兽医 isVet=true isBest=true）
    renderQa('q2');
    expect(screen.getByText('+50 分 · 最佳答主')).toBeInTheDocument();
    expect(screen.queryByText('+20 分 · 优质回答')).not.toBeInTheDocument();
    // 「最佳答案」徽章保留
    expect(screen.getByText('最佳答案')).toBeInTheDocument();
  });

  it('非兽医采纳回答显示「+20 分 · 优质回答」', () => {
    // q3 种子：a4（林小宠 isVet=false）→ 标记最佳后显示普通激励
    useAppStore.getState().markBestAnswer('q3', 'a4');
    renderQa('q3');
    expect(screen.getByText('+20 分 · 优质回答')).toBeInTheDocument();
    expect(screen.queryByText('+50 分 · 最佳答主')).not.toBeInTheDocument();
  });

  it('标记最佳 toast 文案「已标记最佳答案，问题已解决」', () => {
    renderQa('q3'); // q3 提问者 = u_me（当前用户）
    fireEvent.click(screen.getByRole('button', { name: '设为最佳答案' }));
    expect(useAppStore.getState().toast.message).toBe('已标记最佳答案，问题已解决');
    expect(useAppStore.getState().questions.find((q) => q.id === 'q3')!.status).toBe('resolved');
  });
});
