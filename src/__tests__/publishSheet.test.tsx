import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublishSheet } from '@/components/publish/PublishSheet';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';

beforeEach(() => resetStore());

describe('PublishSheet 发布弹层', () => {
  it('open=false 时不渲染内容', () => {
    useAppStore.setState({ publishOverlay: { open: false, mode: 'post' } });
    render(<PublishSheet />);
    expect(screen.queryByText('发布动态')).not.toBeInTheDocument();
  });

  it('发帖模式：空内容点击发布 → 提示"请输入内容"且不发帖', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    render(<PublishSheet />);
    expect(screen.getByText('发布动态')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '发布' }));
    // Toast 由 AppShell 挂载，单测断言 store 状态
    expect(useAppStore.getState().toast.message).toBe('请输入内容');
    expect(useAppStore.getState().toast.visible).toBe(true);
    expect(useAppStore.getState().posts).toHaveLength(7); // 种子 7 条未变
  });

  it('发帖模式：输入内容+选分类 → 发帖成功、置顶、关联默认宠物、提示"发布成功"并关闭', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    render(<PublishSheet />);
    const textarea = screen.getByPlaceholderText(/分享你和毛孩子的故事/);
    fireEvent.change(textarea, { target: { value: '今天带豆豆去洗澡了！' } });
    // 选择"医疗"分类（中文标签区分 pill）
    fireEvent.click(screen.getByRole('button', { name: /^医疗/ }));
    fireEvent.click(screen.getByRole('button', { name: '发布' }));

    const posts = useAppStore.getState().posts;
    expect(posts).toHaveLength(8);
    expect(posts[0].content).toBe('今天带豆豆去洗澡了！');
    expect(posts[0].category).toBe('medical');
    expect(posts[0].authorId).toBe('u_me');
    expect(posts[0].petTag).toContain('豆豆');
    expect(posts[0].petId).toBe('p1'); // 默认选中第一只宠物
    expect(posts[0].tags[0]).toBe('医疗'); // 分类中文名作为第一个标签
    expect(useAppStore.getState().publishOverlay.open).toBe(false);
    expect(useAppStore.getState().toast.message).toBe('发布成功');
  });

  it('提问模式：标题必填 + 详情选填 → 提问成功（title≤60、content=详情）', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'question' } });
    render(<PublishSheet />);
    expect(screen.getByText('发起提问')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/一句话概括你的问题/), {
      target: { value: '猫咪一直不吃东西已经三天了怎么办' },
    });
    fireEvent.change(screen.getByPlaceholderText(/补充更多细节/), {
      target: { value: '一直躲在角落里不出来，精神很差，需要马上看兽医吗？' },
    });
    fireEvent.click(screen.getByRole('button', { name: '提问' }));

    const questions = useAppStore.getState().questions;
    expect(questions).toHaveLength(6); // 种子 5 + 1
    expect(questions[0].title).toBe('猫咪一直不吃东西已经三天了怎么办');
    expect(questions[0].content).toBe('一直躲在角落里不出来，精神很差，需要马上看兽医吗？');
    expect(questions[0].status).toBe('open');
    expect(useAppStore.getState().toast.message).toBe('提问成功');
    expect(useAppStore.getState().publishOverlay.open).toBe(false);
  });

  it('提问模式：默认不关联宠物（「不关联」选中态），发布后 Question.petId 为 undefined', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'question' } });
    render(<PublishSheet />);
    // 关联宠物区存在「不关联」项且默认选中
    const noneBtn = screen.getByRole('button', { name: '不关联' });
    expect(noneBtn.className).toContain('border-brand');

    fireEvent.change(screen.getByPlaceholderText(/一句话概括你的问题/), {
      target: { value: '猫咪一直不吃东西怎么办' },
    });
    fireEvent.click(screen.getByRole('button', { name: '提问' }));

    expect(useAppStore.getState().questions[0].petId).toBeUndefined();
  });

  it('提问模式：选择关联宠物后写入 Question.petId', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'question' } });
    render(<PublishSheet />);
    fireEvent.click(screen.getByRole('button', { name: /咪咪/ }));
    fireEvent.change(screen.getByPlaceholderText(/一句话概括你的问题/), {
      target: { value: '猫咪掉毛严重怎么办' },
    });
    fireEvent.click(screen.getByRole('button', { name: '提问' }));

    expect(useAppStore.getState().questions[0].petId).toBe('p2');
  });

  it('提问模式：空标题提示"请输入标题"且不提问', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'question' } });
    render(<PublishSheet />);
    fireEvent.click(screen.getByRole('button', { name: '提问' }));
    expect(useAppStore.getState().toast.message).toBe('请输入标题');
    expect(useAppStore.getState().questions).toHaveLength(5);
  });

  it('取消按钮关闭弹层且不改数据', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    render(<PublishSheet />);
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(useAppStore.getState().publishOverlay.open).toBe(false);
    expect(useAppStore.getState().posts).toHaveLength(7);
  });

  it('分类默认 health 且可切换（切换后发布使用新分类）', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    render(<PublishSheet />);
    // 默认选中"健康"分类（中文标签区分 pill）
    const healthBtn = screen.getByRole('button', { name: /^健康/ });
    expect(healthBtn.className).toContain('bg-brand');
    // 切到"装备"
    fireEvent.click(screen.getByRole('button', { name: /^装备/ }));
    expect(screen.getByRole('button', { name: /^装备/ }).className).toContain('bg-brand');
    fireEvent.change(screen.getByPlaceholderText(/分享你和毛孩子的故事/), {
      target: { value: '新买的牵引绳很好用' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发布' }));
    expect(useAppStore.getState().posts[0].category).toBe('gear');
    expect(useAppStore.getState().posts[0].tags).toContain('装备');
  });

  it('发布成功后输入框被清空（下次打开是干净状态）', () => {
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    const { unmount } = render(<PublishSheet />);
    fireEvent.change(screen.getByPlaceholderText(/分享你和毛孩子的故事/), {
      target: { value: '测试内容' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发布' }));
    unmount();
    // 重新打开，内容应为空
    useAppStore.setState({ publishOverlay: { open: true, mode: 'post' } });
    render(<PublishSheet />);
    expect((screen.getByPlaceholderText(/分享你和毛孩子的故事/) as HTMLTextAreaElement).value).toBe(
      '',
    );
  });
});
