import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { FeedPage } from '@/pages/FeedPage';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

const renderPost = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/post/${id}`]}>
      <Routes>
        <Route path="/post/:id" element={<PostDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('评论体系（P0-1）', () => {
  it('种子评论渲染：昵称 / 内容 / 楼中楼子回复', () => {
    renderPost('post_1');
    expect(screen.getByText('陈泡泡')).toBeInTheDocument();
    expect(
      screen.getByText('打完疫苗蔫一天很正常，多陪陪它、注意保暖就好～'),
    ).toBeInTheDocument();
    // 楼中楼一级回复（c2，parentId=c1）
    expect(screen.getByText(/48 小时内食欲恢复/)).toBeInTheDocument();
  });

  it('发送非空评论 → 置顶 + 输入清空 + toast + post.comments +1', () => {
    renderPost('post_1');
    const input = screen.getByPlaceholderText('说点什么…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '沙发！' } });
    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    const st = useAppStore.getState();
    expect(st.comments[0].content).toBe('沙发！');
    expect(st.comments[0].postId).toBe('post_1');
    expect(st.comments[0].parentId).toBeUndefined();
    expect(st.posts.find((p) => p.id === 'post_1')!.comments).toBe(24);
    expect(st.toast.message).toBe('评论已发布');
    expect((screen.getByPlaceholderText('说点什么…') as HTMLInputElement).value).toBe('');
  });

  it('空输入发送 → toast 拦截且列表不变', () => {
    renderPost('post_1');
    const before = useAppStore.getState().comments.length;
    fireEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(useAppStore.getState().toast.message).toBe('请输入评论内容');
    expect(useAppStore.getState().comments.length).toBe(before);
    expect(useAppStore.getState().posts.find((p) => p.id === 'post_1')!.comments).toBe(23);
  });

  it('评论数回写：Feed 卡片评论数同步 +1', () => {
    useAppStore.getState().addComment('post_1', '同步测试');
    useAppStore.setState({ activeTab: 'recommend', activeCategory: 'all' });
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );
    // post_1 comments 23 + 1 = 24
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  it('顶层评论可回复（楼中楼）→ 子回复置顶 + 计数 +1', () => {
    renderPost('post_1');
    const replyBtns = screen.getAllByRole('button', { name: '回复' });
    expect(replyBtns.length).toBeGreaterThan(0);
    fireEvent.click(replyBtns[0]);

    const replyInput = screen.getByPlaceholderText('回复 TA…') as HTMLInputElement;
    fireEvent.change(replyInput, { target: { value: '谢谢提醒！' } });
    // 主评论框「发送」与回复框「发送」并存，取最后一个（回复框）
    const sendBtns = screen.getAllByRole('button', { name: '发送' });
    fireEvent.click(sendBtns[sendBtns.length - 1]);

    const st = useAppStore.getState();
    expect(st.comments[0].content).toBe('谢谢提醒！');
    expect(st.comments[0].parentId).toBe('c1');
    expect(st.posts.find((p) => p.id === 'post_1')!.comments).toBe(24);
    expect(st.toast.message).toBe('回复已发布');
  });

  it('子回复不显示「回复」按钮（不嵌套二级及以上）', () => {
    renderPost('post_1');
    // post_1 种子：c1 顶层 + c2 子回复 → 只有 c1 有「回复」
    expect(screen.getAllByRole('button', { name: '回复' })).toHaveLength(1);
  });

  it('无评论帖子显示空态「还没有评论，快来抢沙发～」', () => {
    useAppStore.getState().addPost({
      content: '新帖',
      petTag: '🐶 豆豆',
      tags: [],
      category: 'health',
      images: [],
      source: 'recommend',
    });
    const newPostId = useAppStore.getState().posts[0].id;
    renderPost(newPostId);
    expect(screen.getByText('还没有评论，快来抢沙发～')).toBeInTheDocument();
  });
});
