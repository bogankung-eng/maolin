import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagPicker } from '@/components/publish/TagPicker';

describe('TagPicker 标签选择器', () => {
  it('渲染热门标签 pill（# 前缀）', () => {
    render(<TagPicker value={[]} onChange={() => {}} onToast={() => {}} />);
    expect(screen.getByRole('button', { name: '#日常' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#训练' })).toBeInTheDocument();
  });

  it('点击未选标签触发 onChange 追加', () => {
    const onChange = vi.fn();
    render(<TagPicker value={['日常']} onChange={onChange} onToast={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '#训练' }));
    expect(onChange).toHaveBeenCalledWith(['日常', '训练']);
  });

  it('已选 5 个再点第 6 个 → 超限 toast 且不追加', () => {
    const onChange = vi.fn();
    const onToast = vi.fn();
    const five = ['日常', '训练', '测评', '同城', '聚会'];
    render(<TagPicker value={five} onChange={onChange} onToast={onToast} />);
    fireEvent.click(screen.getByRole('button', { name: '#分享' }));
    expect(onToast).toHaveBeenCalledWith('最多选择 5 个标签');
    expect(onChange).not.toHaveBeenCalled();
  });
});
