import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { resetStore } from '@/test/helpers';
import type { Category, FeedTab } from '@/types';

beforeEach(() => resetStore());

describe('Store 交互逻辑', () => {
  // —— 点赞 ——
  it('toggleLike：未点赞 -> 点赞，likes +1', () => {
    const before = useAppStore.getState().posts.find((p) => p.id === 'post_1')!;
    expect(before.liked).toBe(false);
    expect(before.likes).toBe(128);

    useAppStore.getState().toggleLike('post_1');

    const after = useAppStore.getState().posts.find((p) => p.id === 'post_1')!;
    expect(after.liked).toBe(true);
    expect(after.likes).toBe(129);
  });

  it('toggleLike：已点赞 -> 取消，likes -1', () => {
    // post_2 初始 liked=true, likes=89
    useAppStore.getState().toggleLike('post_2');
    let p = useAppStore.getState().posts.find((p) => p.id === 'post_2')!;
    expect(p.liked).toBe(false);
    expect(p.likes).toBe(88);
  });

  it('toggleLike：再次调用复原到初始值（重复点赞幂等）', () => {
    useAppStore.getState().toggleLike('post_2'); // 128? 不，post_2 初始 89
    useAppStore.getState().toggleLike('post_2'); // 复原
    const p = useAppStore.getState().posts.find((x) => x.id === 'post_2')!;
    expect(p.liked).toBe(true);
    expect(p.likes).toBe(89);
  });

  it('toggleLike：不影响其它帖子', () => {
    useAppStore.getState().toggleLike('post_1');
    const p3 = useAppStore.getState().posts.find((p) => p.id === 'post_3')!;
    expect(p3.liked).toBe(false);
    expect(p3.likes).toBe(256);
  });

  // —— 发帖 ——
  it('addPost：新帖置顶、liked=false、likes=0、source 正确', () => {
    const lenBefore = useAppStore.getState().posts.length;
    const input = {
      content: '我家豆豆今天学会坐下啦',
      petTag: '🐶 豆豆',
      tags: ['日常', '训练'],
      images: ['🐶'],
      source: 'local' as FeedTab,
      category: 'behavior' as Category,
    };
    useAppStore.getState().addPost(input);

    const posts = useAppStore.getState().posts;
    expect(posts.length).toBe(lenBefore + 1);
    const np = posts[0];
    expect(np.content).toBe(input.content);
    expect(np.liked).toBe(false);
    expect(np.likes).toBe(0);
    expect(np.source).toBe('local');
    expect(np.authorId).toBe('u_me');
    expect(np.comments).toBe(0);
    expect(np.shares).toBe(0);
  });

  // —— 提问 ——
  it('addQuestion：新提问置顶、status=open、answers=[]、createdAt 最近', () => {
    const lenBefore = useAppStore.getState().questions.length;
    const before = Date.now();
    useAppStore.getState().addQuestion({ category: 'diet', title: '幼犬一天喂几顿？', content: '求助' });
    const after = Date.now();

    const questions = useAppStore.getState().questions;
    expect(questions.length).toBe(lenBefore + 1);
    const nq = questions[0];
    expect(nq.status).toBe('open');
    expect(nq.answers).toEqual([]);
    expect(nq.authorId).toBe('u_me');
    const created = new Date(nq.createdAt).getTime();
    expect(created).toBeGreaterThanOrEqual(before - 1000);
    expect(created).toBeLessThanOrEqual(after + 1000);
  });

  // —— 回答 ——
  it('addAnswer：回答数 +1，新回答属性正确', () => {
    // q4 初始无回答
    const q4Before = useAppStore.getState().questions.find((q) => q.id === 'q4')!;
    expect(q4Before.answers.length).toBe(0);

    useAppStore.getState().addAnswer('q4', { content: '推荐静音大容量款', isVet: true });

    const q4 = useAppStore.getState().questions.find((q) => q.id === 'q4')!;
    expect(q4.answers.length).toBe(1);
    const a = q4.answers[0];
    expect(a.content).toBe('推荐静音大容量款');
    expect(a.isVet).toBe(true);
    expect(a.isBest).toBe(false);
    expect(a.likes).toBe(0);
    expect(a.authorId).toBe('u_me');
  });

  // —— 最佳答案 ——
  it('markBestAnswer：status=resolved，对应回答 isBest=true，其余 false', () => {
    // q2 有 a2、a3 两条回答，初始 a2.isBest=true
    useAppStore.getState().markBestAnswer('q2', 'a3');
    const q2 = useAppStore.getState().questions.find((q) => q.id === 'q2')!;
    expect(q2.status).toBe('resolved');
    expect(q2.answers.find((a) => a.id === 'a3')!.isBest).toBe(true);
    // 其余回答被重置为 false
    expect(q2.answers.find((a) => a.id === 'a2')!.isBest).toBe(false);
  });

  // —— 紧急标记 ——
  it('markUrgent：status 变为 urgent', () => {
    useAppStore.getState().markUrgent('q4');
    const q4 = useAppStore.getState().questions.find((q) => q.id === 'q4')!;
    expect(q4.status).toBe('urgent');
  });

  // —— 解决 ——
  it('resolveQuestion：status 变为 resolved', () => {
    useAppStore.getState().resolveQuestion('q4');
    const q4 = useAppStore.getState().questions.find((q) => q.id === 'q4')!;
    expect(q4.status).toBe('resolved');
  });

  // —— 视图态 setter ——
  it('setter：Tab / 分类 / QA分类 / 关键词', () => {
    const st = useAppStore.getState();
    st.setActiveTab('local');
    st.setActiveCategory('diet');
    st.setQaCategory('behavior');
    st.setQaKeyword('疫苗');

    const s2 = useAppStore.getState();
    expect(s2.activeTab).toBe('local');
    expect(s2.activeCategory).toBe('diet');
    expect(s2.qaCategory).toBe('behavior');
    expect(s2.qaKeyword).toBe('疫苗');
  });
});
