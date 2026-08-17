import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';
import { PostCard } from '@/components/feed/PostCard';
import { QaItem } from '@/components/qa/QaItem';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { QaDetailPage } from '@/pages/QaDetailPage';
import { seedPosts, seedQuestions } from '@/mock/data';

beforeEach(() => resetStore());

describe('收藏 toggleFavorite（P1）', () => {
  it('toggleFavorite：不存在则前插收藏，存在则移除（幂等）', () => {
    useAppStore.getState().toggleFavorite('post', 'post_1');
    expect(useAppStore.getState().favorites).toHaveLength(1);
    expect(useAppStore.getState().favorites[0]).toMatchObject({ type: 'post', id: 'post_1' });
    expect(useAppStore.getState().favorites[0].savedAt).toEqual(expect.any(String));

    // 再次点击移除
    useAppStore.getState().toggleFavorite('post', 'post_1');
    expect(useAppStore.getState().favorites).toHaveLength(0);
  });

  it('不同 type 相同 id 互不影响', () => {
    useAppStore.getState().toggleFavorite('post', 'x1');
    useAppStore.getState().toggleFavorite('question', 'x1');
    expect(useAppStore.getState().favorites).toHaveLength(2);
  });

  it('收藏写入 localStorage（进 partialize + 首写同步）', () => {
    useAppStore.getState().toggleFavorite('question', 'q1');
    const raw = localStorage.getItem('maolin-store-v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as { state: { favorites: unknown[] } };
    expect(parsed.state.favorites).toHaveLength(1);
    expect(parsed.state.favorites[0]).toMatchObject({ type: 'question', id: 'q1' });
  });
});

describe('FavoriteButton 四处同源（PostCard/QaItem/PostDetail/QaDetail）', () => {
  it('PostCard（post）点击收藏', () => {
    render(
      <MemoryRouter>
        <PostCard post={seedPosts[0]} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(
      useAppStore.getState().favorites.some((f) => f.type === 'post' && f.id === 'post_1'),
    ).toBe(true);
  });

  it('QaItem（question）点击收藏', () => {
    render(
      <MemoryRouter>
        <QaItem question={seedQuestions[0]} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(
      useAppStore.getState().favorites.some((f) => f.type === 'question' && f.id === 'q1'),
    ).toBe(true);
  });

  it('PostDetailPage 渲染收藏按钮并同源写入', () => {
    render(
      <MemoryRouter initialEntries={['/post/post_1']}>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(
      useAppStore.getState().favorites.some((f) => f.type === 'post' && f.id === 'post_1'),
    ).toBe(true);
  });

  it('QaDetailPage 渲染收藏按钮并同源写入', () => {
    render(
      <MemoryRouter initialEntries={['/qa/q1']}>
        <Routes>
          <Route path="/qa/:id" element={<QaDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(
      useAppStore.getState().favorites.some((f) => f.type === 'question' && f.id === 'q1'),
    ).toBe(true);
  });
});
