import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PetDetailPage } from '@/pages/PetDetailPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderPet = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/pet/${id}`]}>
      <Routes>
        <Route path="/pet/:id" element={<PetDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('宠物详情页（P0-3）', () => {
  it('p1 头部：名称 / 品种 pill / 健康提醒文案', () => {
    renderPet('p1');
    expect(screen.getByText('宠物详情')).toBeInTheDocument();
    expect(screen.getByText('豆豆')).toBeInTheDocument();
    expect(screen.getByText('柯基')).toBeInTheDocument();
    // pet.healthReminder 优先展示
    expect(screen.getByText('狂犬疫苗将于近期到期')).toBeInTheDocument();
  });

  it('健康记录仅该宠并按类型分组（疫苗/驱虫），不含他宠记录', () => {
    renderPet('p1');
    expect(screen.getByText('疫苗')).toBeInTheDocument();
    expect(screen.getByText('驱虫')).toBeInTheDocument();
    expect(screen.getByText('狂犬疫苗')).toBeInTheDocument();
    expect(screen.getByText('体内驱虫')).toBeInTheDocument();
    // p3 的「年度体检」不应出现在 p1 页面
    expect(screen.queryByText('年度体检')).not.toBeInTheDocument();
  });

  it('成长信息：健康记录数 + 相关帖子数 + 体重列表', () => {
    renderPet('p2');
    // p2 有 h3(疫苗) + h4(体重) → 2 条健康记录
    expect(screen.getByText('2 条健康记录')).toBeInTheDocument();
    expect(screen.getByText('体重')).toBeInTheDocument();
    expect(screen.getByText('4.8kg')).toBeInTheDocument();
  });

  it('相关帖子聚合：petTag 含宠物名/emoji 的帖子出现', () => {
    renderPet('p1');
    // post_6 petTag「🐶 豆豆」含「豆豆」
    expect(screen.getByText(/豆豆今天满三岁/)).toBeInTheDocument();
  });

  it('无相关帖子时显示空态「还没有 TA 的动态」', () => {
    useAppStore.setState({
      posts: useAppStore.getState().posts.filter((p) => p.id === 'post_2'),
    });
    renderPet('p3'); // 球球：无帖子匹配
    expect(screen.getByText('还没有 TA 的动态')).toBeInTheDocument();
  });

  it('不存在宠物 → 空态「宠物不存在」+ 返回按钮', () => {
    renderPet('nope');
    expect(screen.getByText('宠物不存在')).toBeInTheDocument();
    expect(screen.getByText('返回')).toBeInTheDocument();
  });
});
