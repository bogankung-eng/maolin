import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostCard } from '@/components/feed/PostCard';
import { resetStore } from '@/test/helpers';
import { seedPosts } from '@/mock/data';

beforeEach(() => resetStore());

describe('PostCard 缩略卡 variant（P6）', () => {
  it('compact：正文 clamp-2 + 右图 88×88', () => {
    const { container } = render(
      <MemoryRouter>
        <PostCard post={seedPosts[0]} variant="compact" />
      </MemoryRouter>,
    );
    const contentLink = screen.getByText(/柯基宝宝打完疫苗后有点蔫/);
    expect(contentLink.className).toContain('line-clamp-2');
    expect(container.querySelector('[class*="h-[88px]"]')).not.toBeNull();
    expect(container.querySelector('[class*="w-[88px]"]')).not.toBeNull();
  });

  it('full（默认）：大图 200px，正文不 clamp', () => {
    const { container } = render(
      <MemoryRouter>
        <PostCard post={seedPosts[0]} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[class*="h-[200px]"]')).not.toBeNull();
    const contentLink = screen.getByText(/柯基宝宝打完疫苗后有点蔫/);
    expect(contentLink.className).not.toContain('line-clamp-2');
  });
});
