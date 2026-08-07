import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HealthBanner } from '@/components/health/HealthBanner';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderBanner = () =>
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<HealthBanner />} />
        <Route path="/pet/:id" element={<div>PET_DETAIL</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('健康提醒横幅（P0-6）', () => {
  it('p1 due-soon 橙横幅 + p2 overdue 红横幅且置顶', () => {
    renderBanner();
    const btns = screen.getAllByRole('button');
    expect(btns).toHaveLength(2);
    // p2（overdue 已过期）置顶在前
    expect(btns[0].textContent).toContain('咪咪');
    expect(btns[0].textContent).toContain('已过期');
    expect(btns[0].className).toContain('bg-danger-bg');
    // p1（due-soon 即将到期）在后
    expect(btns[1].textContent).toContain('豆豆');
    expect(btns[1].textContent).toContain('即将到期');
    expect(btns[1].className).toContain('bg-warning-bg');
    // p3 无异常不出现
    expect(screen.queryByText(/球球/)).not.toBeInTheDocument();
  });

  it('同一宠物多条异常记录只出 1 条（取最高严重级 overdue > due-soon）', () => {
    // 给 p1 追加一条 overdue 记录（原 p1 有 due-soon 体内驱虫）
    useAppStore.getState().addHealthRecord({
      petId: 'p1',
      type: 'vaccine',
      title: '狂犬疫苗',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    });
    renderBanner();
    const btns = screen.getAllByRole('button');
    expect(btns).toHaveLength(2); // p1 + p2
    const p1Btn = btns.find((b) => b.textContent?.includes('豆豆'))!;
    // p1 只出 1 条，且显示最高级别 overdue
    expect(p1Btn.textContent).toContain('已过期');
    expect(p1Btn.textContent).not.toContain('即将到期');
  });

  it('仅 normal/none 的宠物不出现横幅（p3 不出）', () => {
    // p3 仅有 none 记录（年度体检无日期）→ 不渲染
    renderBanner();
    expect(screen.queryByText(/球球/)).not.toBeInTheDocument();
  });

  it('无任何异常宠物时不渲染（return null 不占位）', () => {
    useAppStore.setState({ healthRecords: [] });
    renderBanner();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('点击横幅跳转对应宠物详情 /pet/:id', () => {
    renderBanner();
    fireEvent.click(screen.getByText(/咪咪/));
    expect(screen.getByText('PET_DETAIL')).toBeInTheDocument();
  });

  it('状态实时计算：新增异常记录后横幅即时出现', () => {
    useAppStore.setState({ healthRecords: [] });
    renderBanner();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    // 新增一条 due-soon 记录 → 重新渲染出现横幅
    act(() => {
      useAppStore.getState().addHealthRecord({
        petId: 'p3',
        type: 'deworm',
        title: '体内驱虫',
        date: new Date(Date.now() + 10 * 86400000).toISOString(),
      });
    });
    expect(screen.getByText(/球球 · 体内驱虫 即将到期/)).toBeInTheDocument();
  });
});
