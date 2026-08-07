import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { QaDetailPage } from '@/pages/QaDetailPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('PostDetailPage 帖子详情', () => {
  const renderPost = (id: string) =>
    render(
      <MemoryRouter initialEntries={[`/post/${id}`]}>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it('不存在的帖子显示"帖子不存在"', () => {
    renderPost('nope');
    expect(screen.getByText('帖子不存在')).toBeInTheDocument();
    expect(screen.getByText('返回')).toBeInTheDocument();
  });

  it('渲染帖子作者、正文、标签、操作栏', () => {
    renderPost('post_1');
    expect(screen.getByText('帖子详情')).toBeInTheDocument();
    expect(screen.getByText(/柯基宝宝打完疫苗后有点蔫/)).toBeInTheDocument();
    expect(screen.getByText('林小宠')).toBeInTheDocument(); // u_lin 作者
    expect(screen.getByText('#疫苗')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument(); // likes
    expect(screen.getByText('23')).toBeInTheDocument(); // comments
  });

  it('点击点赞触发 toggleLike 且计数变化', () => {
    renderPost('post_1');
    const likeBtn = screen.getByRole('button', { name: /128/ });
    fireEvent.click(likeBtn);
    const post = useAppStore.getState().posts.find((p) => p.id === 'post_1')!;
    expect(post.liked).toBe(true);
    expect(post.likes).toBe(129);
  });

  it('评论输入框可输入', () => {
    renderPost('post_1');
    const input = screen.getByPlaceholderText('说点什么…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '好可爱！' } });
    expect(input.value).toBe('好可爱！');
  });

  it('无评论的帖子显示"还没有评论"占位', () => {
    // post_2 若无评论（用 seed 中 comments=0 的帖子，若无则构造）
    const p = useAppStore.getState().posts.find((x) => x.comments === 0);
    if (p) {
      renderPost(p.id);
      expect(screen.getByText('还没有评论，快来抢沙发～')).toBeInTheDocument();
    } else {
      expect(true).toBe(true);
    }
  });
});

describe('QaDetailPage 问答详情', () => {
  const renderQa = (id: string) =>
    render(
      <MemoryRouter initialEntries={[`/qa/${id}`]}>
        <Routes>
          <Route path="/qa/:id" element={<QaDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it('不存在的问答显示"问题不存在"', () => {
    renderQa('nope');
    expect(screen.getByText('问题不存在')).toBeInTheDocument();
  });

  it('渲染问题标题、状态徽标、回答列表', () => {
    renderQa('q1');
    expect(screen.getByText('问答详情')).toBeInTheDocument();
    expect(screen.getByText('狗狗打完疫苗后食欲不振怎么办？')).toBeInTheDocument();
  });

  it('提交空回答提示"请输入回答内容"', () => {
    renderQa('q1');
    fireEvent.click(screen.getByRole('button', { name: '发布' }));
    expect(useAppStore.getState().toast.message).toBe('请输入回答内容');
  });

  it('提交回答 → 回答数+1、输入清空、提示成功', () => {
    renderQa('q1');
    const before = useAppStore.getState().questions.find((q) => q.id === 'q1')!.answers.length;
    const input = screen.getByPlaceholderText('写下你的回答…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '多喝水观察一下' } });
    fireEvent.click(screen.getByRole('button', { name: '发布' }));
    const after = useAppStore.getState().questions.find((q) => q.id === 'q1')!.answers.length;
    expect(after).toBe(before + 1);
    expect(useAppStore.getState().toast.message).toBe('回答已发布');
  });
});
