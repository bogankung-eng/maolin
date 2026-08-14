import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostCard } from '@/components/feed/PostCard';
import { QaItem } from '@/components/qa/QaItem';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('语义化与可聚焦（article + Link）', () => {
  it('PostCard 使用 article 语义，正文为可聚焦 Link', () => {
    const post = useAppStore.getState().posts.find((p) => p.id === 'post_1')!;
    const { container } = render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    );
    expect(container.querySelector('article')).not.toBeNull();
    const link = screen.getByRole('link', { name: /柯基宝宝打完疫苗后有点蔫/ });
    expect(link).toHaveAttribute('href', '/post/post_1');
  });

  it('QaItem 使用 article 语义，标题为可聚焦 Link', () => {
    const question = useAppStore.getState().questions.find((q) => q.id === 'q1')!;
    const { container } = render(
      <MemoryRouter>
        <QaItem question={question} />
      </MemoryRouter>,
    );
    expect(container.querySelector('article')).not.toBeNull();
    expect(
      screen.getByRole('link', { name: '狗狗打完疫苗后食欲不振怎么办？' }),
    ).toHaveAttribute('href', '/qa/q1');
  });
});
