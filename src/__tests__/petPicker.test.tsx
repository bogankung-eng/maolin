import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PetPicker } from '@/components/publish/PetPicker';
import { seedPets } from '@/mock/data';

describe('PetPicker 关联宠物选择器', () => {
  it('默认选中第一只宠物（绿描边）', () => {
    render(<PetPicker pets={seedPets} onChange={() => {}} />);
    const first = screen.getByRole('button', { name: /豆豆/ });
    expect(first.className).toContain('border-brand');
  });

  it('点击其它宠物触发 onChange 传入对应 petId', () => {
    const onChange = vi.fn();
    render(<PetPicker pets={seedPets} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /咪咪/ }));
    expect(onChange).toHaveBeenCalledWith('p2');
  });

  it('空宠列表回退展示默认宠物豆豆（不阻塞发帖）', () => {
    render(<PetPicker pets={[]} onChange={() => {}} />);
    expect(screen.getByText('豆豆')).toBeInTheDocument();
  });
});
