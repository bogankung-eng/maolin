import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QaList } from '@/components/qa/QaList';
import type { Question } from '@/types';

function makeQ(
  id: string,
  title: string,
  status: Question['status'],
  createdAt: string
): Question {
  return {
    id,
    authorId: 'u1',
    category: 'health',
    title,
    content: 'c',
    answers: [],
    status,
    createdAt,
  };
}

const DAY = 86400000;

describe('QaList 排序（紧急置顶 + 时间倒序）', () => {
  it('紧急项即使创建更早，也应排在最前', () => {
    const oldUrgent = makeQ('qu', '紧急老问题', 'urgent', new Date(Date.now() - 10 * DAY).toISOString());
    const newOpen = makeQ('qo', '最新开放问题', 'open', new Date(Date.now() - 1 * DAY).toISOString());

    render(
      <MemoryRouter>
        <QaList questions={[newOpen, oldUrgent]} />
      </MemoryRouter>
    );

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toBe('紧急老问题');
  });

  it('无紧急项时按时间倒序（新在前）', () => {
    const newer = makeQ('a', 'A新', 'open', new Date(Date.now() - 1 * DAY).toISOString());
    const older = makeQ('b', 'B旧', 'open', new Date(Date.now() - 5 * DAY).toISOString());

    render(
      <MemoryRouter>
        <QaList questions={[older, newer]} />
      </MemoryRouter>
    );

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toBe('A新');
    expect(headings[1].textContent).toBe('B旧');
  });

  it('空列表显示占位文案', () => {
    render(
      <MemoryRouter>
        <QaList questions={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('暂无相关问题')).toBeInTheDocument();
  });
});
