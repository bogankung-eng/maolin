import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PetForm } from '@/components/profile/PetForm';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('PetForm 添加宠物表单', () => {
  it('open=false 不渲染', () => {
    render(<PetForm open={false} onClose={() => {}} />);
    expect(screen.queryByText('添加宠物')).not.toBeInTheDocument();
  });

  it('空昵称提交 → 提示"请输入宠物昵称"且不添加', () => {
    render(<PetForm open={true} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '添加' }));
    expect(useAppStore.getState().toast.message).toBe('请输入宠物昵称');
    expect(useAppStore.getState().pets).toHaveLength(3);
  });

  it('输入昵称+品种提交 → 添加宠物、提示并调用 onClose', () => {
    const onClose = vi.fn();
    render(<PetForm open={true} onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText(/宠物昵称/), { target: { value: '汤圆' } });
    fireEvent.change(screen.getByPlaceholderText(/品种/), { target: { value: '柴犬' } });
    fireEvent.click(screen.getByRole('button', { name: '添加' }));

    const pets = useAppStore.getState().pets;
    expect(pets).toHaveLength(4);
    expect(pets[3].name).toBe('汤圆');
    expect(pets[3].species).toBe('柴犬');
    expect(pets[3].emoji).toBe('🐾');
    expect(useAppStore.getState().toast.message).toBe('已添加宠物');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('取消 → 调用 onClose 且不添加', () => {
    const onClose = vi.fn();
    render(<PetForm open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().pets).toHaveLength(3);
  });
});
